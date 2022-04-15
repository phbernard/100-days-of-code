import { ParamValues } from "@resoc/core";
import { TwitterClient } from 'twitter-api-client';
import fs from 'fs';
import axios from 'axios';
import Stripe from "stripe";

const addHours = (date: Date, hours: number): Date => {
  const future = new Date();
  future.setTime(date.getTime() + (hours * 60 * 60 * 1000));
  return future;
}

export const bannerTemplateParameters = async (twitterClient: TwitterClient, stripeClient: Stripe): Promise<ParamValues> => {
  // User
  const user  = await twitterClient.accountsAndUsers.usersShow({ screen_name: '@ph_bernard' });
  const followerCount = user.followers_count.toString();

  // #100DaysOfCode
  /*
  let currentDay = -1;
  const activeDays: number[] = [];
  const log = await fs.promises.readFile('log.md', { encoding: 'utf8' });
  log.split('\n').forEach(line => {
    const m = line.match(/### Day (\d+):/);
    if (m) {
      const day = parseInt(m[1]);
      activeDays.push(day);
      if (day > currentDay) {
        currentDay = day;
      }
    }
  });
  const daysStatus = new Array(currentDay + 1).fill(false);
  activeDays.forEach(day => {
    daysStatus[day] = true;
  });
  const activity = daysStatus.map(status => ({ status: status ? 'completed' : 'missed' }));
  while (activity.length < 100) {
    activity.push({ status: 'todo' });
  }
  */

  // GitHub stars
  /*
  const gitHubResponse = await axios.get('https://api.github.com/repos/resocio/resoc');
  const resocStars = gitHubResponse.data.stargazers_count;
  */

  // Next generation
  /*
  const next = addHours(new Date(), 2);
  const nextGenerationDate = `${next.getUTCDate()}/${next.getUTCMonth() + 1}/${next.getUTCFullYear()} at ${next.getUTCHours()}:${next.getUTCMinutes()} UTC`;
  */

  // JustMyBio
  const justMyBio = await axios.get('https://app.justmy.bio/api/service-status');
  const resocStars = justMyBio.data.stargazers_count;

  // SaveOurSocial / Stripe
  const gt = Math.round((new Date()).getTime() / 1000) - (60 * 24 * 60 * 60);

  let sosRevenue = 0;
  let moreRecords = false;
  let lastObject = undefined;

  do {
    const t: Stripe.Response<Stripe.ApiList<Stripe.PaymentIntent>> =
      await stripeClient.paymentIntents.list({
        limit: 100,
        created: { gt },
        starting_after: lastObject
      });

    moreRecords = t.has_more;
    lastObject = moreRecords ? t.data[t.data.length - 1].id : undefined;

    t.data.forEach(pi => {
      if (pi.status === 'succeeded') {
        sosRevenue += pi.amount;
      }
    });
  } while (moreRecords);

  do {
    const r: Stripe.Response<Stripe.ApiList<Stripe.Refund>> = await stripeClient.refunds.list({
      limit: 100,
      created: { gt },
      starting_after: lastObject
    });

    moreRecords = r.has_more;
    lastObject = moreRecords ? r.data[r.data.length - 1].id : undefined;

    r.data.forEach(rf => {
      if (rf.status === 'succeeded') {
        sosRevenue -= rf.amount;
      }
    });
  } while (moreRecords);

  sosRevenue = Math.round(sosRevenue / 100);

  return {
    followerCount,
    bioTotal: justMyBio.data.bios.total,
    bioWithCustomDomain: justMyBio.data.bios.withCustomDomain,
    sosRevenue: sosRevenue.toString()
  }
};

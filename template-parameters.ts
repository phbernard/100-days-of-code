import { ParamValues } from "@resoc/core";
import { TwitterClient } from 'twitter-api-client';
import fs from 'fs';
import axios from 'axios';

const addHours = (date: Date, hours: number): Date => {
  const future = new Date();
  future.setTime(date.getTime() + (hours * 60 * 60 * 1000));
  return future;
}

export const bannerTemplateParameters = async (twitterClient: TwitterClient): Promise<ParamValues> => {
  // User
  const user  = await twitterClient.accountsAndUsers.usersShow({ screen_name: '@ph_bernard' });
  const followerCount = user.followers_count.toString();

  // #100DaysOfCode
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

  // GitHub stars
  const gitHubResponse = await axios.get('https://api.github.com/repos/resocio/resoc');
  const resocStars = gitHubResponse.data.stargazers_count;

  // Next generation
  const next = addHours(new Date(), 2);
  const nextGenerationDate = `${next.getUTCDate()}/${next.getUTCMonth() + 1}/${next.getUTCFullYear()} at ${next.getUTCHours()}:${next.getUTCMinutes()} UTC`;

  return {
    followerCount,
    day: currentDay.toString(),
    activity,
    resocStars,
    nextGenerationDate
  }
};

import { ParamValues } from "@resoc/core";
import { TwitterClient } from 'twitter-api-client';
import fs from 'fs';

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

  // GitHub stars
  // TODO: GET https://api.github.com/repos/resocio/resoc

  return {
    followerCount,
    day: currentDay.toString(),
    activity: daysStatus.map(status => ({ status: status ? 'completed' : 'missed' }))
  }
};

import dotenv from 'dotenv';
dotenv.config();

import { TwitterClient } from 'twitter-api-client';
import { domainToUnicode } from 'url';
import fs from 'fs';
import { createImage } from '@resoc/create-img';

const streamToFile = (inputStream: any, filePath: string) => {
  return new Promise((resolve, reject) => {
    const fileWriteStream = fs.createWriteStream(filePath)
    inputStream
      .pipe(fileWriteStream)
      .on('finish', resolve)
      .on('error', reject)
  })
};

const doId = async() => {
  const twitterApiKey = process.env.TWITTER_API_KEY;
  const twitterApiSecret = process.env.TWITTER_API_SECRET;
  if (!twitterApiKey || !twitterApiSecret) {
    console.log("ERROR: Twitter credentials are not configured");
    return;
  }

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

  const bannerFileName = 'new-banner.png';

  await createImage(
    'resoc-twitter-banner/resoc.manifest.json',
    {
      day: currentDay.toString(),
      activity: daysStatus.map(status => ({ status: status ? 'completed' : 'missed' }))
    },
    { width: 1800, height: 600 },
    bannerFileName
  );

  console.log("New banner generated");

  const twitterClient = new TwitterClient({
    apiKey: twitterApiKey,
    apiSecret: twitterApiSecret,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  });

  const banner = await fs.promises.readFile(bannerFileName, { encoding: 'base64' });

  await twitterClient.accountsAndUsers.accountUpdateProfileBanner({ banner });

  console.log("Twitter banner updated");
}

(async () => {
  try {
    await doId();
    console.log("Done!");
  }
  catch(e) {
    console.log(e);
  }
})();

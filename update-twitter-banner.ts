import dotenv from 'dotenv';
dotenv.config();

import { TwitterClient } from 'twitter-api-client';
import { domainToUnicode } from 'url';
import fs from 'fs';
import axios from 'axios';

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

  const params = {
    day: currentDay,
    activity: daysStatus.map(status => ({ status: status ? 'completed' : 'missed' }))
  }
  const imgResponse = await axios.post(
    'https://covers.philippebernard.dev/templates/100-days-of-code-twitter-banner/images/1800x600.png',
    params, {
      responseType: 'stream'
    }
  );
  await streamToFile(imgResponse.data, bannerFileName);

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

console.log("Debug");
console.log("Dummy: " + process.env.DUMMY);
console.log("Inline Dummy: " + process.env.INLINE_DUMMY);

(async () => {
  try {
    await doId();
    console.log("Done!");
  }
  catch(e) {
    console.log(e);
  }
})();

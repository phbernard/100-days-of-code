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
  if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_API_SECRET) {
    console.log("ERROR: Twitter credentials are not configured");
    return;
  }

  const bannerFileName = 'new-banner.png';

  const params = {"day":"3","activity":[{"status":"completed"},{"status":"completed"},{"status":"completed"},{"status":"completed"}]};
  const imgResponse = await axios.post(
    'https://covers.philippebernard.dev/templates/100-days-of-code-twitter-banner/images/1800x600.png',
    params, {
      responseType: 'stream'
    }
  );
  await streamToFile(imgResponse.data, bannerFileName);

  console.log("New banner generated");

  const twitterClient = new TwitterClient({
    apiKey: process.env.TWITTER_API_KEY,
    apiSecret: process.env.TWITTER_API_SECRET,
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

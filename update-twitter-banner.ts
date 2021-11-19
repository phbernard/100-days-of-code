import dotenv from 'dotenv';
dotenv.config();

import { TwitterClient } from 'twitter-api-client';
import { domainToUnicode } from 'url';
import fs from 'fs/promises';

const doId = async() => {
  if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_API_SECRET) {
    console.log("ERROR: Twitter credentials are not configured");
    return;
  }

  const twitterClient = new TwitterClient({
    apiKey: process.env.TWITTER_API_KEY,
    apiSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  });

  const banner = await fs.readFile('my-image.png', {encoding: 'base64'});

  twitterClient.accountsAndUsers.accountUpdateProfileBanner({
    banner
  });
}

(() => {
  doId();
})();

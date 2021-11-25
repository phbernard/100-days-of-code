import { bannerTemplateParameters } from '../template-parameters';
import { createImage } from '@resoc/create-img';
import { TwitterClient } from 'twitter-api-client';
import { BannerFileName, createBanner, initTwitterClient } from './utils';
import fs from 'fs';

(async () => {
  const twitterClient = initTwitterClient();
  const parameters = await bannerTemplateParameters(twitterClient);
  await createBanner(parameters, BannerFileName);
  const banner = await fs.promises.readFile(BannerFileName, { encoding: 'base64' });
  await twitterClient.accountsAndUsers.accountUpdateProfileBanner({ banner });
})();

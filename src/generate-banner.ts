import { bannerTemplateParameters } from '../template-parameters';
import { createImage } from '@resoc/create-img';
import { TwitterClient } from 'twitter-api-client';
import { BannerFileName, createBanner, initTwitterClient } from './utils';

(async () => {
  const twitterClient = initTwitterClient();

  const parameters = await bannerTemplateParameters(twitterClient);

  await createBanner(parameters, BannerFileName);
})();

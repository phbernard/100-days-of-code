import { bannerTemplateParameters } from '../template-parameters';
import { createImage } from '@resoc/create-img';
import { TwitterClient } from 'twitter-api-client';
import { BannerFileName, createBanner, initStripeClient, initTwitterClient } from './utils';

(async () => {
  const twitterClient = initTwitterClient();
  const stripeClient = initStripeClient();

  const parameters = await bannerTemplateParameters(twitterClient, stripeClient);

  await createBanner(parameters, BannerFileName);
})();

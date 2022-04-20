require('dotenv').config();

import { ParamValues } from "@resoc/core";
import { createImage } from "@resoc/create-img";
import Stripe from "stripe";
import { TwitterClient } from "twitter-api-client";
import { v8 } from 'todoist'

export const BannerFileName = 'twitter-banner.png';

export const initTwitterClient = (): TwitterClient => {
  const twitterApiKey = process.env.TWITTER_API_KEY;
  const twitterApiSecret = process.env.TWITTER_API_SECRET;
  const twitterAccessToken = process.env.TWITTER_ACCESS_TOKEN;
  const twitterAccessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;
  if (!twitterApiKey || !twitterApiSecret) {
    throw "Twitter credentials are not configured";
  }

  return new TwitterClient({
    apiKey: twitterApiKey,
    apiSecret: twitterApiSecret,
    accessToken: twitterAccessToken,
    accessTokenSecret: twitterAccessTokenSecret
  });
};

export const initStripeClient = (): Stripe => (
  new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // https://github.com/stripe/stripe-node#configuration
    apiVersion: '2020-08-27',
  })
);

export const initTodoistClient = () => (
  v8(process.env.TODOIST_API_KEY!)
)

export const createBanner = async (parameters: ParamValues, outputFileName: string) => {
  await createImage(
    'resoc-templates/banner/resoc.manifest.json',
    parameters,
    { width: 1800, height: 600 },
    outputFileName
  );
};

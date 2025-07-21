import { ObjectId } from 'mongoose';

export type TSubscription = {
  user: ObjectId;
  plan: ObjectId;
  stripe_subscription_id: string;
};

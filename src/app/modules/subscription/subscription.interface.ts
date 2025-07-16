import { ObjectId } from 'mongoose';

export type TSubscription = {
  user: ObjectId;
  plan: ObjectId;
  start_date: Date;
  end_date: Date;
  stripe_subscription_id: string;
  status: 'pending' | 'active' | 'canceled' | 'expired';
};

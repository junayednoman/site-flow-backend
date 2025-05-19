import { ObjectId } from 'mongoose';

export type TSubscription = {
  user: ObjectId;
  plan: ObjectId;
  start_date: Date;
  end_date: Date;
  status: 'active' | 'canceled' | 'expired';
};

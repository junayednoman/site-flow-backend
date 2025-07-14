import { ObjectId } from 'mongoose';

export type TSubscriptionPlan = {
  _id?: ObjectId;
  name: string;
  max_users: number;
  price: number;
  billing_cycle: string;
  is_deleted?: boolean;
};
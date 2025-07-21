import { ObjectId } from 'mongoose';

export type TSubscriptionPlan = {
  _id?: ObjectId;
  name: string;
  max_users: number;
  price: number;
  interval: "year" | "month" | "day";
  stripe_product_id: string;
  stripe_price_id: string;
  is_deleted?: boolean;
};
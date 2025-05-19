import { ObjectId } from 'mongoose';

export interface TPayment {
  user: ObjectId;
  amount: number;
  transaction_id: string;
  status: string;
  currency: string;
  purpose: "subscription" | "star";
}
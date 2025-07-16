import { ObjectId } from 'mongoose';

export interface TPayment {
  user: ObjectId;
  amount: number;
  transaction_id: string;
  status: "pending" | "paid" | "failed";
  currency: string;
  purpose: "subscription";
}
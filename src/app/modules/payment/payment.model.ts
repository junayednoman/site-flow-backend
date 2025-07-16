import { model, Schema } from "mongoose";
import { TPayment } from "./payment.interface";

const paymentSchema = new Schema<TPayment>({
  user: { type: Schema.Types.ObjectId, ref: 'Auth', required: true },
  amount: { type: Number, required: true },
  transaction_id: { type: String, required: true },
  status: { type: String, enum: ["pending", "paid", "failed"], required: true, default: "pending" },
  currency: { type: String, required: true, default: "USD" },
  purpose: { type: String, enum: ['subscription'], required: true, default: 'subscription' },
}, {
  timestamps: true
})

const Payment = model<TPayment>('Payment', paymentSchema);
export default Payment;
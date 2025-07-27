import { model, Schema } from "mongoose";
import { TPayment } from "./payment.interface";

const paymentSchema = new Schema<TPayment>({
  user: { type: Schema.Types.ObjectId, ref: 'Auth', required: true },
  amount: { type: Number, required: true },
  transaction_id: { type: String, required: true },
  status: { type: String, enum: ["pending", "paid", "failed"], required: true },
  currency: { type: String, required: true, default: "USD" },
}, {
  timestamps: true
})

const Payment = model<TPayment>('Payment', paymentSchema);
export default Payment;
import { model, Schema } from "mongoose";
import { TSubscriptionPlan } from "./subscriptionPlan.interface";

const subscriptionPlanSchema = new Schema<TSubscriptionPlan>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true },
  description: { type: String, required: true }
}, {
  timestamps: true
})

const SubscriptionPlan = model<TSubscriptionPlan>('SubscriptionPlan', subscriptionPlanSchema);
export default SubscriptionPlan;
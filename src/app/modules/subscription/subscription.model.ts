import { model, Schema } from "mongoose";
import { TSubscription } from "./subscription.interface";

const subscriptionSchema = new Schema<TSubscription>({
  user: { type: Schema.Types.ObjectId, ref: 'Auth', required: true },
  plan: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  stripe_subscription_id: { type: String, required: true },
  status: { type: String, enum: ['pending', 'active', 'canceled', 'expired'], default: 'active' },
}, {
  timestamps: true
})

const Subscription = model<TSubscription>('Subscription', subscriptionSchema);
export default Subscription;
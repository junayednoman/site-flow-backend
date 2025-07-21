import { model, Schema } from "mongoose";
import { TSubscription } from "./subscription.interface";

const subscriptionSchema = new Schema<TSubscription>({
  user: { type: Schema.Types.ObjectId, ref: 'Auth', required: true },
  plan: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
  stripe_subscription_id: { type: String, required: true },
}, {
  timestamps: true
})

const Subscription = model<TSubscription>('Subscription', subscriptionSchema);
export default Subscription;
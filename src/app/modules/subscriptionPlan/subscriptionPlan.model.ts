import mongoose from 'mongoose';
import { TSubscriptionPlan } from './subscriptionPlan.interface';

const SubscriptionPlanSchema = new mongoose.Schema<TSubscriptionPlan>({
  name: { type: String, required: [true, "Name is required"], trim: true, unique: true },
  max_users: { type: Number, required: [true, "Max users is required"], min: 1 },
  price: { type: Number, required: [true, "Price is required"], min: 0 },
  interval: { type: String, required: [true, "Billing cycle is required"], enum: ['year', 'month'], trim: true },
  stripe_product_id: { type: String },
  is_deleted: { type: Boolean, default: false },
}, {
  timestamps: true,
});

const SubscriptionPlan = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);

export default SubscriptionPlan;
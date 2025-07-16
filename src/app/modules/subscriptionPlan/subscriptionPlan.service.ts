import SubscriptionPlan from './subscriptionPlan.model';
import { AppError } from '../../classes/appError';
import { TSubscriptionPlan } from './subscriptionPlan.interface';
import Stripe from 'stripe';
import config from '../../config';
import mongoose from 'mongoose';

// Initialize the Stripe client
const stripe = new Stripe(config.stripe_secret_key as string, {
  apiVersion: "2025-02-24.acacia",
});

const createSubscriptionPlan = async (payload: TSubscriptionPlan) => {
  const existingPlan = await SubscriptionPlan.findOne({ $or: [{ name: payload.name, interval: payload.interval }] });
  if (existingPlan) throw new AppError(400, "Interval or name already exists!");

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const plan = await SubscriptionPlan.create([payload], { session });

    if (plan) {
      const stripeProduct = await stripe.products.create({
        name: payload.name,
        default_price_data: {
          unit_amount: payload.price * 100,
          currency: 'usd',
          recurring: {
            interval: payload.interval
          }
        },
      })

      await SubscriptionPlan.findByIdAndUpdate(plan[0]?._id, { stripe_product_id: stripeProduct.id, stripe_price_id: stripeProduct.default_price }, { session });
    }

    await session.commitTransaction();
    return plan;
  } catch (error: any) {
    await session.abortTransaction();
    throw new AppError(400, error?.message || "Failed to create subscription plan!");
  } finally {
    session.endSession();
  }
};

const updateSubscriptionPlan = async (planId: string, payload: Partial<TSubscriptionPlan>) => {
  const plan = await SubscriptionPlan.findById(planId);
  if (!plan) throw new AppError(404, "Subscription plan not found!");
  const oldStripePriceId = plan?.stripe_price_id

  const existingPlan = await SubscriptionPlan.findOne({ $or: [{ name: payload.name, interval: payload.interval }], _id: { $ne: planId } });
  if (existingPlan) throw new AppError(400, "Interval or name already exists!");

  if (payload.name) {
    const existingPlan = await SubscriptionPlan.findOne({ name: payload.name, _id: { $ne: planId } });
    if (existingPlan) throw new AppError(400, "Subscription plan with this name already exists!");
  }

  // Update local fields
  Object.assign(plan, payload);
  await plan.save();

  // Update product name if changed
  if (payload.name) {
    await stripe.products.update(plan.stripe_product_id, {
      name: payload.name,
    });
  }

  // Handle price/interval update
  if (payload.price || payload.interval) {
    //  Create new price first
    const newPrice = await stripe.prices.create({
      product: plan.stripe_product_id,
      unit_amount: (payload.price ?? plan.price) * 100,
      currency: 'usd',
      recurring: {
        interval: payload.interval ?? plan.interval,
      },
    });

    // Update product's default price
    await stripe.products.update(plan.stripe_product_id, {
      default_price: newPrice.id,
    });

    // Update DB with new price ID first
    plan.stripe_price_id = newPrice.id;
    await plan.save();

    // deactivate old price
    await stripe.prices.update(oldStripePriceId, {
      active: false,
    });
  }

  return plan;
};

const getAllSubscriptionPlans = async () => {
  const plans = await SubscriptionPlan.find({ is_deleted: false });
  return plans;
};

const getSingleSubscriptionPlan = async (planId: string) => {
  const plan = await SubscriptionPlan.findOne({ _id: planId, is_deleted: false });
  if (!plan) throw new AppError(404, "Subscription plan not found!");
  return plan;
};


export default { createSubscriptionPlan, updateSubscriptionPlan, getAllSubscriptionPlans, getSingleSubscriptionPlan };
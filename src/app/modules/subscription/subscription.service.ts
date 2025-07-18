import Stripe from "stripe";
import { AppError } from "../../classes/appError";
import QueryBuilder from "../../classes/queryBuilder";
import SubscriptionPlan from "../subscriptionPlan/subscriptionPlan.model";
import Subscription from "./subscription.model";
import config from "../../config";
import { TSubscription } from "./subscription.interface";
import mongoose, { ObjectId } from "mongoose";
import { TPayment } from "../payment/payment.interface";
import { generateTransactionId } from "../../utils/transactionIdGenerator";
import Payment from "../payment/payment.model"

// Initialize the Stripe client
const stripe = new Stripe(config.stripe_secret_key as string, {
  apiVersion: "2025-02-24.acacia",
});

const createSubscriptionCheckoutSession = async (userId: string, customer_email: string, planId: string) => {
  const plan = await SubscriptionPlan.findById(planId)
  if (!plan) throw new AppError(400, "Invalid plan id!");

  const transaction_id = generateTransactionId()
  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    customer_email,
    line_items: [
      {
        price: plan.stripe_price_id,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${config.origin}/subscriptions/success?session_id={CHECKOUT_SESSION_ID}&transaction_id=${transaction_id}&user_id=${userId}&plan=${planId}`,
    cancel_url: `${config.origin}/subscriptions/cancel?transaction_id=${transaction_id}&user_id=${userId}`,
  })

  // create subscription and payment for the user
  if (checkoutSession.url) {
    const now = new Date();
    let endDate = now;
    if (plan.interval === 'month') {
      endDate = new Date(now.setMonth(now.getMonth() + 1));
    } else if (plan.interval === 'year') {
      endDate = new Date(now.setFullYear(now.getFullYear() + 1));
    }

    const subscriptionPayload: TSubscription = {
      user: userId as unknown as ObjectId,
      plan: planId as unknown as ObjectId,
      start_date: new Date(),
      end_date: endDate,
      status: "pending",
      stripe_subscription_id: checkoutSession.subscription as string
    }
    const paymentPayload: Partial<TPayment> = {
      user: userId as unknown as ObjectId,
      amount: plan.price,
      transaction_id,
    }

    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      await Subscription.create([subscriptionPayload], { session });
      await Payment.create([paymentPayload], { session });

      await session.commitTransaction();
    } catch (error: any) {
      await session.abortTransaction();
      throw new AppError(500, error.message || "Error creating checkout session!");
    } finally {
      session.endSession();
    }
  }
  return { url: checkoutSession.url };
}

const subscriptionSuccess = async (sessionId: string, transactionId: string, userId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  // update the subscription & payment status
  if (session.payment_status === "paid") {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      await Subscription.findOneAndUpdate({ user: userId, status: "pending" }, { status: "active" });
      await Payment.findOneAndUpdate({ transaction_id: transactionId, status: "pending" }, { status: "paid" });

      await session.commitTransaction();
    } catch (error: any) {
      await session.abortTransaction();
      throw new AppError(500, error.message || "Payment failed!");
    } finally {
      session.endSession();
    }
  }
}

const subscriptionCancel = async (transactionId: string, user: string) => {
  await Payment.findOneAndDelete({ transaction_id: transactionId, status: "pending" });
  await Subscription.findOneAndDelete({ user, status: "pending" });
  throw new AppError(400, "Payment failed!");
}

const getAllSubscriptions = async (query: Record<string, any>) => {
  const searchableFields = [
    "name",
    "email"
  ];
  const userQuery = new QueryBuilder(
    Subscription.find(),
    query
  )
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .selectFields();

  const meta = await userQuery.countTotal();
  const result = await userQuery.queryModel.populate("user", "name email").populate("plan", "name");
  return { data: result, meta };
};

const getSingleSubscription = async (id: string) => {
  const result = await Subscription.findById(id).populate("user", "name email").populate("plan", "name");
  return result;
};

const getMySubscription = async (id: string) => {
  const result = await Subscription.findOne({ user: id, status: "active" }).populate("plan", "name price max_users interval");
  const stripeSubscription = await stripe.subscriptions.retrieve(result!.stripe_subscription_id);
  const auto_renewal_status = stripeSubscription.cancel_at_period_end === false ? "on" : "off";
  return { ...result?.toObject(), auto_renewal_status };
};

const turnOnAutoRenewal = async (userId: string, stripeSubscriptionId: string) => {
  const subscription = await Subscription.findOne({ stripe_subscription_id: stripeSubscriptionId, status: "active" });
  if (!subscription) throw new AppError(400, "Subscription not found!")
  if (userId !== subscription.user.toString()) throw new AppError(401, "Unauthorized")

  const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  if (stripeSub.cancel_at_period_end) {
    await stripe.subscriptions.update(stripeSubscriptionId, { cancel_at_period_end: false });
  }
}

const turnOffAutoRenewal = async (userId: string, stripeSubscriptionId: string) => {
  const subscription = await Subscription.findOne({ stripe_subscription_id: stripeSubscriptionId, status: "active" });
  if (!subscription) throw new AppError(400, "Subscription not found!")
  if (userId !== subscription.user.toString()) throw new AppError(401, "Unauthorized")

  const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  if (!stripeSub.cancel_at_period_end) {
    await stripe.subscriptions.update(stripeSubscriptionId, { cancel_at_period_end: true });
  }
}

const subscriptionServices = {
  createSubscriptionCheckoutSession,
  subscriptionSuccess,
  subscriptionCancel,
  getAllSubscriptions,
  getSingleSubscription,
  getMySubscription,
  turnOnAutoRenewal,
  turnOffAutoRenewal
};

export default subscriptionServices;
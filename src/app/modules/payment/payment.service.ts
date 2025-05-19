import Stripe from "stripe";
import config from "../../config";
import { AppError } from "../../classes/appError";
import mongoose from "mongoose";
import Payment from "./payment.model";
import { generateTransactionId } from "../../utils/transactionIdGenerator";
import QueryBuilder from "../../classes/queryBuilder";
import SubscriptionPlan from "../subscriptionPlan/subscriptionPlan.model";
import Subscription from "../subscription/subscription.model";

// Initialize the Stripe client
const stripe = new Stripe(config.stripe_secret_key as string, {
  apiVersion: "2025-02-24.acacia",
});

// payment for buying subscription
const createSessionForSubscription = async (planId: string, email: string, currentUserId: string) => {
  const plan = await SubscriptionPlan.findOne({ _id: planId });
  if (!plan) throw new AppError(404, "Invalid subscription plan id!");
  const planPrice = Number(plan?.price * 100);

  const transaction_id = generateTransactionId();

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: plan?.name,
          },
          unit_amount: Math.ceil((planPrice)),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    customer_email: email,
    success_url: `${config.subscription_payment_success_url}?session_id={CHECKOUT_SESSION_ID}&user_id=${currentUserId}&transaction_id=${transaction_id}&plan=${plan?._id}&duration=${plan?.duration}`,
    cancel_url: config.subscription_payment_cancel_url,
  });

  return { url: session.url };
};

const verifySubscriptionPayment = async (query: Record<string, any>) => {
  const { session_id, user_id, transaction_id, plan, duration } = query;
  const paymentSession = await stripe.checkout.sessions.retrieve(session_id);

  const session = await mongoose.startSession();
  const isPaymentExist = await Payment.findOne({ transaction_id })
  if (isPaymentExist) {
    return;
  }

  if (paymentSession.payment_status === 'paid') {
    session.startTransaction();

    const paymentData = {
      user: user_id,
      amount: (paymentSession.amount_total! / 100).toFixed(2),
      transaction_id,
      status: "paid",
      currency: paymentSession.currency,
      purpose: "subscription",
    }

    const start_date = new Date();
    let end_date = new Date(start_date);
    end_date.setMonth(start_date.getMonth() + duration);

    const subscription = await Subscription.findOne({ user: user_id });

    if (subscription) {
      const previous_end_date = subscription.end_date;
      const monthsRemaining = Math.max(0, (previous_end_date.getFullYear() - start_date.getFullYear()) * 12 + previous_end_date.getMonth() - start_date.getMonth());
      end_date = new Date(start_date);
      end_date.setMonth(start_date.getMonth() + monthsRemaining + duration);
    }

    const subscriptionData = {
      user: user_id,
      plan,
      start_date,
      end_date,
      status: "active",
    }

    try {
      await Subscription.findOneAndUpdate({ user: user_id }, subscriptionData, { session, upsert: true });
      await Payment.create([paymentData], { session });

      await session.commitTransaction();
    } catch (error: any) {
      await session.abortTransaction();
      throw new AppError(500, error.message || "Error verifying payment");
    } finally {
      session.endSession();
    }
  } else throw new AppError(400, "Payment failed!");
}

const getAllPayments = async (query: Record<string, any>) => {
  const { startDate, endDate, ...restQuery } = query;
  const reportQuery = {} as any;
  if (startDate && endDate) {
    reportQuery.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    }
  }
  const searchableFields = [
    "amount",
    "purpose",
    "status",
    "transaction_id"
  ];
  const userQuery = new QueryBuilder(
    Payment.find(reportQuery),
    restQuery
  )
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .selectFields();

  const meta = await userQuery.countTotal();
  const result = await userQuery.queryModel.populate("user", "name email image");
  return { data: result, meta };
};

const getSinglePayment = async (id: string) => {
  const result = await Payment.findOne({ _id: id }).populate("user", "name email image");
  return result;
}

export const paymentServices = {
  getAllPayments,
  getSinglePayment,
  createSessionForSubscription,
  verifySubscriptionPayment
}
import Stripe from "stripe";
import { AppError } from "../../classes/appError";
import QueryBuilder from "../../classes/queryBuilder";
import SubscriptionPlan from "../subscriptionPlan/subscriptionPlan.model";
import Subscription from "./subscription.model";
import config from "../../config";
import { TSubscription } from "./subscription.interface";
import { ObjectId } from "mongoose";

// Initialize the Stripe client
const stripe = new Stripe(config.stripe_secret_key as string, {
  apiVersion: "2025-02-24.acacia",
});

const createSubscriptionCheckoutSession = async (userId: string, customer_email: string, planId: string) => {
  const plan = await SubscriptionPlan.findById(planId)
  if (!plan) throw new AppError(400, "Invalid plan id!");

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
    success_url: `${config.origin}/subscriptions/success?session_id={CHECKOUT_SESSION_ID}&plan_id=${planId}&user_id=${userId}`,
    cancel_url: `${config.origin}/subscriptions/cancel`,
    expand: ["subscription"]
  })
  return { url: checkoutSession.url };
}

const subscriptionSuccess = async (sessionId: string, planId: string, userId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  // update the subscription & payment status
  if (session.payment_status === "paid") {
    const existing = await Subscription.findOne({ stripe_subscription_id: session.subscription as string });
    if (!existing) {
      const subscriptionPayload: TSubscription = {
        user: userId as unknown as ObjectId,
        plan: planId as unknown as ObjectId,
        stripe_subscription_id: session.subscription as string
      }
      await Subscription.create(subscriptionPayload);
    }
  }
}

const subscriptionCreationFail = async () => {
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
  const result = await Subscription.findOne({ user: id }).populate("plan", "name price max_users interval");
  const stripeSubscription = await stripe.subscriptions.retrieve(result!.stripe_subscription_id);
  const auto_renewal_status = stripeSubscription.cancel_at_period_end === false ? "on" : "off";
  return { ...result?.toObject(), auto_renewal_status, status: stripeSubscription.status, current_period_end: stripeSubscription.current_period_end };
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

const updateSubscription = async (stripe_subscription_id: string, new_plan_id: string) => {
  const plan = await SubscriptionPlan.findById(new_plan_id);
  if (!plan) throw new AppError(400, "Invalid plan id!");
  const stripeSubscription = await stripe.subscriptions.retrieve(stripe_subscription_id);
  const subscriptionItemId = stripeSubscription.items.data[0].id;
  await stripe.subscriptions.update(stripe_subscription_id, {
    items: [
      {
        id: subscriptionItemId,
        price: plan.stripe_price_id,
      },
    ],
    proration_behavior: 'create_prorations',
  });
}

const subscriptionServices = {
  createSubscriptionCheckoutSession,
  subscriptionCreationFail,
  getAllSubscriptions,
  getSingleSubscription,
  getMySubscription,
  turnOnAutoRenewal,
  turnOffAutoRenewal,
  updateSubscription,
  subscriptionSuccess
};

export default subscriptionServices;
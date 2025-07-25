import handleAsyncRequest from "../../utils/handleAsyncRequest";
import { successResponse } from "../../utils/successResponse";
import subscriptionServices from "./subscription.service";

const createSubscriptionCheckoutSession = handleAsyncRequest(async (req: any, res) => {
  const planId = req.body.plan_id;
  const userId = req.user.id;
  const customer_email = req.user.email;
  const result = await subscriptionServices.createSubscriptionCheckoutSession(userId, customer_email, planId);
  successResponse(res, {
    message: "Checkout session created successfully!",
    data: result
  });
})

const subscriptionSuccess = handleAsyncRequest(async (req: any, res) => {
  const { session_id, plan_id, user_id } = req.query;
  await subscriptionServices.subscriptionSuccess(session_id, plan_id, user_id);
  successResponse(res, {
    message: "Payment successful!",
  });
})

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
const subscriptionCreationFail = handleAsyncRequest(async (req, res) => {
  await subscriptionServices.subscriptionCreationFail()
})

const getAllSubscriptions = handleAsyncRequest(async (req, res) => {
  const query = req.query;
  const result = await subscriptionServices.getAllSubscriptions(query);
  successResponse(res, {
    message: "Subscriptions retrieved successfully!",
    data: result
  });
});

const getSingleSubscription = handleAsyncRequest(async (req, res) => {
  const id = req.params.id;
  const result = await subscriptionServices.getSingleSubscription(id);
  successResponse(res, {
    message: "Subscription retrieved successfully!",
    data: result
  });
});

const getMySubscription = handleAsyncRequest(async (req: any, res) => {
  const id = req.user.id;
  const result = await subscriptionServices.getMySubscription(id);
  successResponse(res, {
    message: "Subscription retrieved successfully!",
    data: result
  });
});

const turnOnAutoRenewal = handleAsyncRequest(async (req: any, res) => {
  const id = req.params.stripeSubId;
  const userId = req.user.id;
  const result = await subscriptionServices.turnOnAutoRenewal(userId, id);
  successResponse(res, {
    message: "Auto-renewal turned on successfully!",
    data: result
  });
});

const turnOffAutoRenewal = handleAsyncRequest(async (req: any, res) => {
  const id = req.params.stripeSubId;
  const userId = req.user.id;
  const result = await subscriptionServices.turnOffAutoRenewal(userId, id);
  successResponse(res, {
    message: "Auto-renewal turned off successfully!",
    data: result
  });
});

const updateSubscription = handleAsyncRequest(async (req: any, res) => {
  const { stripe_subscription_id, new_plan_id } = req.body;
  const result = await subscriptionServices.updateSubscription(stripe_subscription_id, new_plan_id);
  successResponse(res, {
    message: "Subscription updated successfully!",
    data: result
  });
});

const subscriptionControllers = {
  createSubscriptionCheckoutSession,
  subscriptionSuccess,
  subscriptionCreationFail,
  getAllSubscriptions,
  getSingleSubscription,
  getMySubscription,
  turnOnAutoRenewal,
  turnOffAutoRenewal,
  updateSubscription
};

export default subscriptionControllers;
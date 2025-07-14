import handleAsyncRequest from "../../utils/handleAsyncRequest";
import { successResponse } from "../../utils/successResponse";
import subscriptionPlanService from "./subscriptionPlan.service";

const createSubscriptionPlan = handleAsyncRequest(async (req: any, res) => {
  const id = req.user.id; // Kept for potential logging
  const payload = req.body;
  const result = await subscriptionPlanService.createSubscriptionPlan(id, payload);
  successResponse(res, {
    message: "Subscription plan created successfully!",
    data: result,
    status: 201,
  });
});

const updateSubscriptionPlan = handleAsyncRequest(async (req: any, res) => {
  const { planId } = req.params;
  const id = req.user.id; // Kept for potential logging
  const payload = req.body;
  const result = await subscriptionPlanService.updateSubscriptionPlan(planId, id, payload);
  successResponse(res, {
    message: "Subscription plan updated successfully!",
    data: result,
  });
});

const getAllSubscriptionPlans = handleAsyncRequest(async (req: any, res) => {
  const result = await subscriptionPlanService.getAllSubscriptionPlans();
  successResponse(res, {
    message: "Subscription plans retrieved successfully!",
    data: result,
  });
});

const getSingleSubscriptionPlan = handleAsyncRequest(async (req: any, res) => {
  const { planId } = req.params;
  const result = await subscriptionPlanService.getSingleSubscriptionPlan(planId);
  successResponse(res, {
    message: "Subscription plan retrieved successfully!",
    data: result,
  });
});

const softDeleteSubscriptionPlan = handleAsyncRequest(async (req: any, res) => {
  const { planId } = req.params;
  const result = await subscriptionPlanService.softDeleteSubscriptionPlan(planId);
  successResponse(res, {
    message: "Subscription plan soft deleted successfully!",
    data: result,
  });
});

const subscriptionPlanController = {
  createSubscriptionPlan,
  updateSubscriptionPlan,
  getAllSubscriptionPlans,
  getSingleSubscriptionPlan,
  softDeleteSubscriptionPlan,
};
export default subscriptionPlanController;
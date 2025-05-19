import handleAsyncRequest from "../../utils/handleAsyncRequest";
import { successResponse } from "../../utils/successResponse";
import { SubscriptionPlanServices } from "./subscriptionPlan.service";

const createSubscriptionPlan = handleAsyncRequest(
  async (req, res) => {
    const payload = req.body;
    const result = await SubscriptionPlanServices.createSubscriptionPlan(payload);
    successResponse(res, {
      message: "Subscription plan created successfully!",
      data: result,
      status: 201
    });
  }
)

const getAllSubscriptionPlans = handleAsyncRequest(
  async (req, res) => {
    const result = await SubscriptionPlanServices.getAllSubscriptionPlans();
    successResponse(res, {
      message: "Subscription plans retrieved successfully!",
      data: result
    });
  }
)

const getSingleSubscriptionPlan = handleAsyncRequest(
  async (req, res) => {
    const id = req.params.id;
    const result = await SubscriptionPlanServices.getSingleSubscriptionPlan(id);
    successResponse(res, {
      message: "Subscription plan retrieved successfully!",
      data: result
    });
  }
)

const updateSubscriptionPlan = handleAsyncRequest(
  async (req, res) => {
    const id = req.params.id;
    const payload = req.body;
    const result = await SubscriptionPlanServices.updateSubscriptionPlan(id, payload);
    successResponse(res, {
      message: "Subscription plan updated successfully!",
      data: result
    });
  }
)

const deleteSubscriptionPlan = handleAsyncRequest(
  async (req, res) => {
    const id = req.params.id;
    const result = await SubscriptionPlanServices.deleteSubscriptionPlan(id);
    successResponse(res, {
      message: "Subscription plan deleted successfully!",
      data: result
    });
  }
)

export const subscriptionPlanControllers = {
  createSubscriptionPlan,
  getAllSubscriptionPlans,
  getSingleSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan
}
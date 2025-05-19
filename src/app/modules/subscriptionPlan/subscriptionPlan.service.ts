import { AppError } from "../../classes/appError";
import { TSubscriptionPlan } from "./subscriptionPlan.interface";
import SubscriptionPlan from "./subscriptionPlan.model"

const createSubscriptionPlan = async (payload: TSubscriptionPlan) => {
  const plan = await SubscriptionPlan.findOne({ price: payload.price, duration: payload.duration });
  if (plan) throw new AppError(400, "A plan already exists with this price and duration!");
  const result = await SubscriptionPlan.create(payload);
  return result;
}

const getAllSubscriptionPlans = async () => {
  const result = await SubscriptionPlan.find().sort({ createdAt: -1 });
  return result;
}

const getSingleSubscriptionPlan = async (id: string) => {
  const result = await SubscriptionPlan.findById(id);
  return result;
}

const updateSubscriptionPlan = async (id: string, payload: Partial<TSubscriptionPlan>) => {
  const plan = await SubscriptionPlan.findById(id);
  if (!plan) throw new AppError(404, "Plan not found!");

  const result = await SubscriptionPlan.findByIdAndUpdate(id, payload, { new: true });
  return result;
}

const deleteSubscriptionPlan = async (id: string) => {
  const plan = await SubscriptionPlan.findById(id);
  if (!plan) throw new AppError(404, "Plan not found!");
  const result = await SubscriptionPlan.findByIdAndDelete(id);
  return result;
}

export const SubscriptionPlanServices = {
  createSubscriptionPlan,
  getAllSubscriptionPlans,
  getSingleSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan
}
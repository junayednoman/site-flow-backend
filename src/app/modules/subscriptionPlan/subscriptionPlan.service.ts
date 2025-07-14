import { ObjectId, startSession } from 'mongoose';
import SubscriptionPlan from './subscriptionPlan.model';
import { AppError } from '../../classes/appError';
import { TSubscriptionPlan } from './subscriptionPlan.interface';

const createSubscriptionPlan = async (userId: ObjectId, payload: TSubscriptionPlan) => {
  const existingPlan = await SubscriptionPlan.findOne({ name: payload.name });
  if (existingPlan) throw new AppError(400, "Subscription plan with this name already exists!");

  const plan = await SubscriptionPlan.create(payload);
  return plan;
};

const updateSubscriptionPlan = async (planId: string, userId: ObjectId, payload: Partial<TSubscriptionPlan>) => {
  const plan = await SubscriptionPlan.findById(planId);
  if (!plan) throw new AppError(404, "Subscription plan not found!");

  if (payload.name) {
    const existingPlan = await SubscriptionPlan.findOne({ name: payload.name, _id: { $ne: planId } });
    if (existingPlan) throw new AppError(400, "Subscription plan with this name already exists!");
  }

  Object.assign(plan, payload);
  await plan.save();
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

const softDeleteSubscriptionPlan = async (planId: string) => {
  const session = await startSession();
  session.startTransaction();

  try {
    const plan = await SubscriptionPlan.findById(planId).session(session);
    if (!plan) throw new AppError(404, "Subscription plan not found!");

    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    /// CHECK IF ANY SUBSCRIPTION IS ASSOCIATED WITH THIS PLAN ///
    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////

    plan.is_deleted = true;
    await plan.save({ session });
    await session.commitTransaction();
    return plan;
  } catch (error: any) {
    await session.abortTransaction();
    throw new AppError(500, error.message || "Error soft deleting subscription plan!");
  } finally {
    session.endSession();
  }
};

export default { createSubscriptionPlan, updateSubscriptionPlan, getAllSubscriptionPlans, getSingleSubscriptionPlan, softDeleteSubscriptionPlan };
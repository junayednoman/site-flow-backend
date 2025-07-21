import { z } from 'zod';

export const subscriptionCreateSchema = z.object({
  plan_id: z.string().min(1, "Plan id is required"),
});

export const updateSubscriptionValidationSchema = z.object({
  stripe_subscription_id: z.string().min(1, "Stripe subscription id is required"),
  new_plan_id: z.string().min(1, "New plan id is required"),
});
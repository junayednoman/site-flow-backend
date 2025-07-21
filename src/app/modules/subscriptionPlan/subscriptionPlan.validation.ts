import { z } from 'zod';

const subscriptionPlanBaseSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  max_users: z.number().min(1, "Max users must be at least 1"),
  price: z.number().min(0, "Price cannot be negative"),
  interval: z.enum(['month', 'year', 'day'], { required_error: "Interval is required" }),
});

export const createSubscriptionPlanValidationSchema = subscriptionPlanBaseSchema.strict();
export const updateSubscriptionPlanValidationSchema = subscriptionPlanBaseSchema.partial().strict();
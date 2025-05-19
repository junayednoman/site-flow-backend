import { z } from 'zod';

export const SubscriptionSchema = z.object({
  plan: z.string().min(1, "Plan is required"),
});

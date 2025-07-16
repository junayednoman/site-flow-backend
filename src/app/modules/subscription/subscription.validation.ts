import { z } from 'zod';

export const subscriptionCreateSchema = z.object({
  plan_id: z.string().min(1, "Plan id is required"),
});

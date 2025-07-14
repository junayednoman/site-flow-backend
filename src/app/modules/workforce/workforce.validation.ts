import { z } from 'zod';

export const workforceValidationSchema = z.array(
  z.object({
    project: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'),
    name: z.string().min(1),
    quantity: z.number().int().nonnegative(),
  })
);
export const updateWorkforceValidationSchema = z.object({
  name: z.string().optional(),
  quantity: z.number().optional()
});

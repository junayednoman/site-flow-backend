import { z } from 'zod';

export const subscriptionPlanValidationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().min(0, "Price must be a positive number"),
  duration: z.number({ invalid_type_error: "Duration must be provided as month in number" }).min(1, "Duration is required"),
  description: z.string().min(1, "Description is required"),
});

export const updateSubscriptionPlanValidationSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  price: z.number().min(0, "Price must be a positive number").optional(),
  duration: z.number({ invalid_type_error: "Duration must be provided as month in number" }).optional(),
  description: z.string().min(1, "Description is required").optional(),
});
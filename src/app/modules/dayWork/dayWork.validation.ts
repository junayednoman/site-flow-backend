import { z } from "zod";

export const dayWorkZodSchema = z.object({
  name: z.string().min(1),
  project: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
  description: z.string().min(1),
  date: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
  }, z.date()),
  duration: z.string().min(1),
  workforces: z.array(
    z.object({
      workforce: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
      quantity: z.number().int().nonnegative(),
      duration: z.string().min(1),
    })
  ),
  equipments: z.array(
    z.object({
      equipment: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
      quantity: z.number().int().nonnegative(),
      duration: z.string().min(1),
    })
  ),
  materials: z.string().optional(),
  image: z.string().url().optional(),
  location: z.string().optional(),
  delay: z.string().optional(),
  comment: z.string().optional(),
});

export const updateDayWorkZodSchema = dayWorkZodSchema.partial();

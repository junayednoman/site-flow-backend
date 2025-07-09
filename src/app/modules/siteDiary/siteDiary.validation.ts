import { z } from "zod";

export const siteDiaryZodSchema = z.object({
  name: z.string().min(1),
  project: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
  description: z.string().min(1),
  date: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
  }, z.date()),
  weather_condition: z.string().optional(),
  duration: z.string().min(1),
  tasks: z.array(
    z.object({
      name: z.string().min(1),
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
    })
  ),
  image: z.string().url().optional(),
  location: z.string().optional(),
});

export const updateSiteDiaryZodSchema = siteDiaryZodSchema.partial();

export const delayValidation = z.object({
  delay: z.string({ required_error: "Delay is required" })
});

export const commentValidation = z.object({
  comment: z.string({ required_error: "Comment is required" })
});

export const addTaskZodSchema = z.object({
  name: z.string().min(1, "Task name is required"),
  workforces: z.array(
    z.object({
      workforce: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
      quantity: z.number().int().nonnegative("Quantity must be a non-negative integer"),
      duration: z.string().min(1, "Duration is required"),
    })
  ).optional(),
  equipments: z.array(
    z.object({
      equipment: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
      quantity: z.number().int().nonnegative("Quantity must be a non-negative integer"),
      duration: z.string().min(1, "Duration is required"),
    })
  ).optional(),
});
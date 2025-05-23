import mongoose from "mongoose";
import { z } from "zod";

export const ProjectValidationSchema = z.object({
  client_name: z.string().min(1, "client_name is required"),
  name: z.string().min(1, "name is required"),
  location: z.string().min(1, "location is required"),
  timeline: z.preprocess(arg => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
  }, z.date()),
  note: z.string().optional(),
  employee: z.string().refine(val => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid employee ObjectId",
  }).optional(),
});
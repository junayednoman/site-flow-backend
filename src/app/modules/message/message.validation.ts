import { z } from "zod";

// Validation schema for createMessage
export const createMessageValidationSchema = z.object({
  content: z.string().min(1, "Content is required"),
}).strict();

// Validation schema for updateMessage
export const updateMessageValidationSchema = z.object({
  content: z.string().min(1, "Content is required"),
}).strict();
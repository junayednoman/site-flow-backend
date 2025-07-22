import { z } from "zod";

export const createChatGroupValidationSchema = z.object({
  project: z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), "Invalid project ID"),
});

export const addParticipantValidationSchema = z.object({
  user_id: z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), "Invalid user ID"),
})
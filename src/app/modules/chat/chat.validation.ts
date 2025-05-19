import { z } from "zod";

export const chatValidationSchema = z.object({
  recipientId: z.string({ required_error: "Recipient id is required" })
})
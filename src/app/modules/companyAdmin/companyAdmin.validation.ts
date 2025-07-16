import { z } from "zod";

export const companyUpdateSchema = z.object({
  name: z.string().optional(),
  company_name: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
});
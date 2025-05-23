import { z } from "zod";

export const companySchema = z.object({
  name: z.string().nonempty("Name is required"),
  company_name: z.string().nonempty("Company name is required"),
  email: z.string().email("Invalid email address"),
  logo: z.string().url().optional(),
  phone: z.string().optional(),
});
import { z } from 'zod';

export const employeeValidationSchema = z.object({
  type: z.enum(['supervisor', 'manager']),
  name: z.string().min(1, "Name is required"),
  employee_id: z.string().min(1, "Employee ID is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().nullable().optional(),
  password: z.string().min(1, "Password is required"),
});

export const updateEmployeeValidationSchema = z.object({
  name: z.string().optional(),
  phone: z.string().nullable().optional(),
});

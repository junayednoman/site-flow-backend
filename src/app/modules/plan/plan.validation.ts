import { z } from "zod";

const workforceTaskValidation = z.object({
  workforce: z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
    message: "Invalid workforce ID",
  }),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  duration: z.string().min(1, "Duration is required"),
});

const equipmentTaskValidation = z.object({
  equipment: z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
    message: "Invalid equipment ID",
  }),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  duration: z.string().min(1, "Duration is required"),
});

const taskValidation = z.object({
  name: z.string().min(1, "Task name is required"),
  workforces: z.array(workforceTaskValidation).optional(),
  equipments: z.array(equipmentTaskValidation).optional(),
});

const createPlanValidation = z.object({
  project: z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
    message: "Invalid project ID",
  }),
  name: z.string().min(1, "Name is required"),
  date: z.string().optional(),
  deadline: z.string().optional(),
  tasks: z.array(taskValidation).min(1, "At least one task is required"),
});

const updatePlanValidation = z.object({
  project: z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
    message: "Invalid project ID",
  }).optional(),
  name: z.string().min(1, "Name is required").optional(),
  date: z.string().optional(),
  deadline: z.string().optional(),
  tasks: z.array(taskValidation).optional(),
});

const addTaskValidation = z.object({
  name: z.string().min(1, "Task name is required"),
  workforces: z.array(workforceTaskValidation).optional(),
  equipments: z.array(equipmentTaskValidation).optional(),
});

export { createPlanValidation, updatePlanValidation, addTaskValidation };
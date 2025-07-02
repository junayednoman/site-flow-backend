import { z } from "zod"

export const planZodSchema = z.object({
  name: z.string(),
  project: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  deadline: z.coerce.date(),
  workforces: z.array(
    z.object({
      workforce: z.string(),
      quantity: z.number(),
      duration: z.string()
    })
  ),
  equipments: z.array(
    z.object({
      equipment: z.string(),
      quantity: z.number(),
      duration: z.string()
    })
  )
})

export const updatePlanZodSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  date: z.coerce.date().optional(),
  deadline: z.coerce.date().optional(),
  workforces: z.array(
    z.object({
      workforce: z.string(),
      quantity: z.number(),
      duration: z.string()
    })
  ).optional(),
  equipments: z.array(
    z.object({
      equipment: z.string(),
      quantity: z.number(),
      duration: z.string()
    })
  ).optional()
})

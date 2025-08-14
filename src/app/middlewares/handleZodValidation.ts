import { NextFunction, Request, Response } from "express"
import { AnyZodObject, ZodArray, ZodObject } from "zod"

export const handleZodValidation = (schema: AnyZodObject | ZodArray<ZodObject<any>>, parsedData = false) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (parsedData && req.body.payload) {
      await schema?.parseAsync(JSON.parse(req?.body?.payload))
      next()
    }
    else {
      await schema?.parseAsync(req.body)
      next()
    }
  } catch (error) {
    next(error)
  }
}

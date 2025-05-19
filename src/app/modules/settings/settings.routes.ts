import { Router } from 'express'
import settingsController from './settings.controller'
import authVerify from '../../middlewares/authVerify'
import { updateSettingsSchema } from './settings.validation'
import { handleZodValidation } from '../../middlewares/handleZodValidation'

export const settingsRoutes = Router()

settingsRoutes.get('/', authVerify(['admin', "user"]), settingsController.getSettingsData)
settingsRoutes.put(
  '/',
  authVerify(['admin']),
  handleZodValidation(updateSettingsSchema),
  settingsController.updateSettingsData,
)

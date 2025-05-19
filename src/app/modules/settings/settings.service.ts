import { AppError } from '../../classes/appError'
import { TSettings } from './settings.interface'
import SettingsModel from './settings.model'

const getSettingsData = async () => {
  const settings = await SettingsModel.find()
  return { settings: settings[0] }
}

const updateSettingsData = async (payload: TSettings) => {
  const setting = await SettingsModel.find()

  if (!setting[0]) {
    throw new AppError(404, 'Settings not found')
  }

  const result = await SettingsModel.findByIdAndUpdate(setting[0]?.id, payload, {
    new: true,
  })
  return result
}

const settngsServices = {
  getSettingsData,
  updateSettingsData,
}

export default settngsServices

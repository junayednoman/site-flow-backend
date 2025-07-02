import { ObjectId } from "mongoose"

export type TPlan = {
  author: ObjectId
  name: string
  project: ObjectId
  description: string
  date: Date
  deadline: Date
  workforces: { workforce: string; quantity: number; duration: string }[]
  equipments: { equipment: string; quantity: number; duration: string }[]
}

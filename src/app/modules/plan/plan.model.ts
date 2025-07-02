import mongoose from "mongoose"
import { TPlan } from "./plan.interface"

const PlanSchema = new mongoose.Schema<TPlan>(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', required: true },
    name: { type: String, required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    deadline: { type: Date, required: true },
    workforces: {
      type: [{ workforce: { type: mongoose.Types.ObjectId, ref: "Workforce", required: true }, quantity: Number, duration: String }],
      required: true
    },
    equipments: {
      type: [{ equipment: { type: mongoose.Types.ObjectId, ref: "Equipment", required: true }, quantity: Number, duration: String }],
      required: true
    }
  },
  { timestamps: true }
)

const Plan = mongoose.model<TPlan>('Plan', PlanSchema)
export default Plan
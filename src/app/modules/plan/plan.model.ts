import { Schema, model } from "mongoose";
import { TEquipmentTask, TPlan, TTask, TWorkforceTask } from "./plan.interface";

const workforceTaskSchema = new Schema<TWorkforceTask>({
  workforce: { type: Schema.Types.ObjectId, ref: "Workforce", required: true },
  quantity: { type: Number, required: true },
  duration: { type: String, required: true },
});

const equipmentTaskSchema = new Schema<TEquipmentTask>({
  equipment: { type: Schema.Types.ObjectId, ref: "Equipment", required: true },
  quantity: { type: Number, required: true },
  duration: { type: String, required: true },
});

const taskSchema = new Schema<TTask>({
  name: { type: String, required: true },
  workforces: [workforceTaskSchema],
  equipments: [equipmentTaskSchema],
});

const planSchema = new Schema<TPlan>(
  {
    added_by: { type: Schema.Types.ObjectId, ref: "Auth", required: true },
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    name: { type: String, required: true },
    due_date: { type: Date },
    due_time: { type: Date },
    tasks: [taskSchema],
  },
  {
    timestamps: true,
  }
);

export const Plan = model<TPlan>("Plan", planSchema);
export default Plan;
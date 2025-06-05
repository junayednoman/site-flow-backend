import mongoose, { Schema, Types } from "mongoose";
import { TDayWork } from "./dayWork.interface";

const WorkforceSchema = new Schema({
  workforce: { type: Types.ObjectId, ref: "Workforce", required: true },
  quantity: { type: Number, required: true },
  duration: { type: String, required: true },
});

const EquipmentSchema = new Schema({
  equipment: { type: Types.ObjectId, ref: "Equipment", required: true },
  quantity: { type: Number, required: true },
  duration: { type: String, required: true },
});

const DayWorkSchema = new Schema<TDayWork>(
  {
    name: { type: String, required: true },
    project: { type: Types.ObjectId, ref: "Project", required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    duration: { type: String, required: true },
    workforces: { type: [WorkforceSchema], required: true },
    equipments: { type: [EquipmentSchema], required: true },
    materials: { type: String, },
    image: { type: String },
    location: { type: String },
    delay: { type: String },
    comment: { type: String },
  },
  { timestamps: true }
);

export const DayWork = mongoose.model("DayWork", DayWorkSchema);

export default DayWork;

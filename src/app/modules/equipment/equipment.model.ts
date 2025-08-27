import mongoose, { Schema, Types } from 'mongoose';
import { TEquipment } from './equipment.interface';

const equipmentSchema = new Schema<TEquipment>({
  project: { type: Types.ObjectId, ref: 'Project', required: true },
  name: { type: String, required: true },
  initial_quantity: { type: Number, required: true },
  quantity: { type: Number, required: true },
  is_deleted: { type: Boolean, default: false },
}, {
  timestamps: true
});

export const Equipment = mongoose.model<TEquipment>('Equipment', equipmentSchema);

export default Equipment;
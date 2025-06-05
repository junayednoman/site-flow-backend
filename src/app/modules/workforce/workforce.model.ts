import mongoose, { Schema, Types } from 'mongoose';
import { TWorkforce } from './workforce.interface';

const workforceSchema = new Schema<TWorkforce>({
  project: { type: Types.ObjectId, ref: 'Project', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  is_deleted: { type: Boolean, default: false },
}, {
  timestamps: true
});

export const Workforce = mongoose.model<TWorkforce>('Workforce', workforceSchema);

export default Workforce;
import mongoose from 'mongoose';
import { TEmployee } from './employee.interface';

const EmployeeSchema = new mongoose.Schema<TEmployee>({
  type: {
    type: String,
    enum: ['supervisor', 'manager'],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  employee_id: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    default: null,
  },
  company_admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auth',
    required: true,
  },
  is_deleted: {
    type: Boolean,
    default: false,
  }
});

export const Employee = mongoose.model('Employee', EmployeeSchema);

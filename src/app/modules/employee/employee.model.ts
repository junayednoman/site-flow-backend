import mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema({
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
    ref: 'CompanyAdmin',
    required: true,
  },
});

export const Employee = mongoose.model('Employee', EmployeeSchema);

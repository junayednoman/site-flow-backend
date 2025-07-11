import mongoose from 'mongoose';
import { TExcavationReport } from './excavationReport.interface';

const ExcavationReportSchema = new mongoose.Schema<TExcavationReport>({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, unique: true },
  contract: { type: String, required: [true, "Contract number is required"], trim: true },
  date: { type: Date, required: [true, "Date is required"] },
  drawing_reference_incl_revision: { type: String, required: [true, "Drawing Reference Incl Revision is required"], trim: true },
  revision: { type: String, required: [true, "Revision is required"], trim: true },
  location_of_work: { type: String, required: [true, "Location of work is required"], trim: true },
  completion_status: { type: String, enum: ["completed", "in-progress", "not-completed"], required: [true, "Completion status is required"] },
  sub_contractor: { type: String, trim: true, required: false },
  compliance_check: { type: Boolean, required: true },
  check_for_underground_services: { type: Boolean, required: true },
  comment: { type: String, trim: true },
  signed_on_completion_signature: { type: String },
  client_approved_signature: { type: String },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', required: true },
}, {
  timestamps: true,
});

const ExcavationReport = mongoose.model('ExcavationReport', ExcavationReportSchema);

export default ExcavationReport;
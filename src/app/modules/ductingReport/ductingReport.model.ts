import mongoose from 'mongoose';
import { TDuctingReport } from './ductingReport.interface';

const DuctingReportSchema = new mongoose.Schema<TDuctingReport>({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, unique: true },
  contract: { type: String, required: [true, "Contract number is required"], trim: true },
  date: { type: Date, required: [true, "Date is required"] },
  drawing_reference_incl_revision: { type: String, required: [true, "Drawing Reference Including Revision is required"], trim: true },
  location_of_work: { type: String, required: [true, "Location of work is required"], trim: true },
  completion_status: { type: String, enum: ["completed", "in-progress", "not-completed"], required: [true, "Completion status is required"] },
  sub_contractor: { type: String, trim: true, required: false },
  bed_type_and_thickness: { type: Boolean, required: true },
  installation_pipe_type: { type: String, required: true },
  line: { type: Boolean, required: true },
  level: { type: Boolean, required: true },
  position: { type: Boolean, required: true },
  gradient: { type: Boolean, required: true },
  pop_up_dealed_off: { type: Boolean, required: true },
  test_air_water_cctv_mandrill: { type: Boolean, required: true },
  test_certificate_reference: { type: String, trim: true, required: false },
  pipe_haunching_surrounding: { type: Boolean, required: true },
  pipe_type: { type: String, required: true },
  compaction: { type: Boolean, required: true },
  backfill: { type: Boolean, required: true },
  thickness: { type: Boolean, required: true },
  type: { type: Boolean, required: true },
  marker_tape: { type: Boolean, required: true },
  install_by: { type: String, trim: true, required: true },
  comment: { type: String, trim: true },
  client_approved_signature: { type: String },
  signed_on_completion_signature: { type: String },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', required: true },
}, {
  timestamps: true,
});

const DuctingReport = mongoose.model('DuctingReport', DuctingReportSchema);

export default DuctingReport;
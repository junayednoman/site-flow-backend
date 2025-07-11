import mongoose from 'mongoose';
import { TPostPourInspectionReport, TInspectionDetail } from './postPourInspectionReport.interface';

const InspectionDetailSchema = new mongoose.Schema<TInspectionDetail>({
  inspection: { type: Boolean, required: true },
  comment: { type: String, trim: true },
});

const PostPourInspectionReportSchema = new mongoose.Schema<TPostPourInspectionReport>({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, unique: true },
  pour_no: { type: String, required: [true, "Pour number is required"], trim: true },
  pour_date: { type: Date, required: [true, "Pour date is required"] },
  inspection_date: { type: Date, required: [true, "Inspection date is required"] },
  drawing_no: { type: String, required: [true, "Drawing number is required"], trim: true },
  ga_drawing: { type: String, required: [true, "GA drawing is required"], trim: true },
  temporary_works: { type: String, required: [true, "Temporary works is required"], trim: true },
  pour_reference: { type: String, required: [true, "Pour reference is required"], trim: true },
  setting_out: {
    line: { type: Boolean, required: true },
    inspection: { type: Boolean, required: true },
    comment: { type: String, trim: true },
  },
  concrete_finish_type: { type: InspectionDetailSchema, required: true },
  chamfers_edging_etc: { type: InspectionDetailSchema, required: true },
  drainage_elements: { type: InspectionDetailSchema, required: true },
  holding_down_bolts: { type: InspectionDetailSchema, required: true },
  crack_inducers: { type: InspectionDetailSchema, required: true },
  waterproofing_membrane: { type: InspectionDetailSchema, required: true },
  others: { type: InspectionDetailSchema, required: true },
  comment: { type: String, trim: true },
  signed_on_completion_signature: { type: String }, // URL to the uploaded image
  client_approved_signature: { type: String }, // URL to the uploaded image
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', required: true },
}, {
  timestamps: true,
});

const PostPourInspectionReport = mongoose.model('PostPourInspectionReport', PostPourInspectionReportSchema);

export default PostPourInspectionReport;
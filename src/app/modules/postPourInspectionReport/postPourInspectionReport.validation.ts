import { z } from 'zod';

const inspectionDetailSchema = z.object({
  inspection: z.boolean(),
  comment: z.string().trim().optional(),
});

const postPourInspectionReportSchema = z.object({
  project: z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), "Invalid project ID"),
  pour_no: z.string().min(1, "Pour number is required").trim(),
  pour_date: z.string({ required_error: "Pour date is required" }),
  inspection_date: z.string({ required_error: "Inspection date is required" }),
  drawing_no: z.string().min(1, "Drawing number is required").trim(),
  ga_drawing: z.string().min(1, "GA drawing is required").trim(),
  temporary_works: z.string().min(1, "Temporary works is required").trim(),
  pour_reference: z.string().min(1, "Pour reference is required").trim(),
  setting_out: z.object({
    line: z.boolean(),
    inspection: z.boolean(),
    comment: z.string().trim().optional(),
  }),
  concrete_finish_type: inspectionDetailSchema,
  chamfers_edging_etc: inspectionDetailSchema,
  drainage_elements: inspectionDetailSchema,
  holding_down_bolts: inspectionDetailSchema,
  crack_inducers: inspectionDetailSchema,
  waterproofing_membrane: inspectionDetailSchema,
  others: inspectionDetailSchema,
  comment: z.string().trim().optional(),
});

export const addOrReplacePostPourInspectionReportValidationSchema = postPourInspectionReportSchema.strict();
export const removeSignatureValidationSchema = z.object({
  signatureType: z.enum(["client_approved_signature", "signed_on_completion_signature"], { required_error: "Signature type is required" }),
}).strict();
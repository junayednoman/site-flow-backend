import { z } from 'zod';

const excavationReportSchema = z.object({
  project: z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), "Invalid project ID"),
  contract: z.string().min(1, "Contract number is required").trim(),
  date: z.string({ required_error: "Date is required" }),
  drawing_reference_incl_revision: z.string().min(1, "Drawing Reference Incl Revision is required").trim(),
  revision: z.string().min(1, "Revision is required").trim(),
  location_of_work: z.string().min(1, "Location of work is required").trim(),
  completion_status: z.enum(["completed", "in-progress", "not-completed"], { required_error: "Completion status is required" }),
  sub_contractor: z.string().trim(),
  compliance_check: z.boolean(),
  check_for_underground_services: z.boolean(),
  comment: z.string().trim().optional(),
});

export const addOrReplaceExcavationReportValidationSchema = excavationReportSchema.strict();
export const removeSignatureValidationSchema = z.object({
  signatureType: z.enum(["client_approved_signature", "signed_on_completion_signature"], { required_error: "Signature type is required" }),
}).strict();
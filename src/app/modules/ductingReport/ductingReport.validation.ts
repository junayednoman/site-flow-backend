import { z } from 'zod';

const ductingReportSchema = z.object({
  project: z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), "Invalid project ID"),
  contract: z.string().min(1, "Contract number is required").trim().optional(),
  date: z.string({ required_error: "Date is required" }).optional(),
  drawing_reference_incl_revision: z.string().min(1, "Drawing Reference Including Revision is required").trim().optional(),
  location_of_work: z.string().min(1, "Location of work is required").trim().optional(),
  completion_status: z.enum(["completed", "in-progress", "not-completed"], { required_error: "Completion status is required" }).optional(),
  sub_contractor: z.string().trim().optional(),
  bed_type_and_thickness: z.boolean().optional(),
  installation_pipe_type: z.string().min(1, "Installation pipe type is required").optional(),
  line: z.boolean().optional(),
  level: z.boolean().optional(),
  position: z.boolean().optional(),
  gradient: z.boolean().optional(),
  pop_up_dealed_off: z.boolean().optional(),
  test_air_water_cctv_mandrill: z.boolean().optional(),
  test_certificate_reference: z.string().trim().optional(),
  pipe_haunching_surrounding: z.boolean().optional(),
  pipe_type: z.string().min(1, "Pipe type is required").optional(),
  compaction: z.boolean().optional(),
  backfill: z.boolean().optional(),
  thickness: z.boolean().optional(),
  type: z.boolean().optional(),
  marker_tape: z.boolean().optional(),
  install_by: z.string().min(1, "Install by is required").trim().optional(),
  comment: z.string().trim().optional(),
});

export const addOrReplaceDuctingReportValidationSchema = ductingReportSchema.strict();
export const removeSignatureValidationSchema = z.object({
  signatureType: z.enum(["client_approved_signature", "signed_on_completion_signature"], { required_error: "Signature type is required" }),
}).strict();
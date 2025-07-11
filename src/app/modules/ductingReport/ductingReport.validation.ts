import { z } from 'zod';

const ductingReportSchema = z.object({
  project: z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), "Invalid project ID"),
  contract: z.string().min(1, "Contract number is required").trim(),
  date: z.string({ required_error: "Date is required" }),
  drawing_reference_incl_revision: z.string().min(1, "Drawing Reference Including Revision is required").trim(),
  location_of_work: z.string().min(1, "Location of work is required").trim(),
  completion_status: z.enum(["completed", "in-progress", "not-completed"], { required_error: "Completion status is required" }),
  sub_contractor: z.string().trim(),
  bed_type_and_thickness: z.boolean(),
  installation_pipe_type: z.string().min(1, "Installation pipe type is required"),
  line: z.boolean(),
  level: z.boolean(),
  position: z.boolean(),
  gradient: z.boolean(),
  pop_up_dealed_off: z.boolean(),
  test_air_water_cctv_mandrill: z.boolean(),
  test_certificate_reference: z.string().trim(),
  pipe_haunching_surrounding: z.boolean(),
  pipe_type: z.string().min(1, "Pipe type is required"),
  compaction: z.boolean(),
  backfill: z.boolean(),
  thickness: z.boolean(),
  type: z.boolean(),
  marker_tape: z.boolean(),
  install_by: z.string().min(1, "Install by is required").trim(),
  comment: z.string().trim().optional(),
});

export const addOrReplaceDuctingReportValidationSchema = ductingReportSchema.strict();
export const removeSignatureValidationSchema = z.object({
  signatureType: z.enum(["client_approved_signature", "signed_on_completion_signature"], { required_error: "Signature type is required" }),
}).strict();
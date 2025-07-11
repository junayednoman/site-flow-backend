import { ObjectId } from 'mongoose';

export type TExcavationReport = {
  _id?: ObjectId;
  contract: string;
  date: Date;
  drawing_reference_incl_revision: string;
  revision: string;
  location_of_work: string;
  completion_status: "completed" | "in-progress" | "not-completed";
  sub_contractor?: string;
  compliance_check: boolean;
  check_for_underground_services: boolean;
  comment?: string;
  signed_on_completion_signature?: string; // URL to the uploaded image
  client_approved_signature?: string; // URL to the uploaded image
  updated_by?: ObjectId;
  project: ObjectId; // Added to align with unique constraint and existing logic
};
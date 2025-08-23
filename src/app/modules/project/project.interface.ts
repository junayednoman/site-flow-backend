import { ObjectId } from "mongoose";

export type TProjectType = {
  client_name: string;
  company_admin: ObjectId | string;
  name: string;
  location: string;
  timeline: string;
  note?: string;
  supervisor: ObjectId;
  manager: ObjectId;
};
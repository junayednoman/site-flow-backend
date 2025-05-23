import { ObjectId } from "mongoose";

export type TAuth = {
  email: string;
  password: string;
  user: ObjectId
  role: "supervisor" | "project_manager" | "company_admin" | "admin";
  user_type: "Supervisor" | "ProjectManager" | "CompanyAdmin" | "Admin";
  is_account_verified: boolean;
  otp?: string;
  otp_expires?: Date;
  otp_attempts: number;
  is_otp_verified: boolean;
  is_deleted: boolean;
  is_blocked: boolean;
};

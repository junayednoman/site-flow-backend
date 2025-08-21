import { ObjectId } from "mongoose";

export type TEmployee = {
  type: 'supervisor' | 'manager';
  name: string;
  employee_id: string;
  image?: string;
  email: string;
  phone?: string | null;
  company_admin: ObjectId | string;
  is_deleted?: boolean;
};

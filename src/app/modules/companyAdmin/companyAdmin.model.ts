import { model, Schema } from "mongoose";
import { TCompanyAdmin } from "./companyAdmin.interface";

const companyAdminSchema = new Schema<TCompanyAdmin>({
  name: { type: String, required: true },
  company_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String, required: false },
  logo: { type: String, required: false },
  phone: { type: String, default: null }
}, {
  timestamps: true
})

const CompanyAdmin = model<TCompanyAdmin>("CompanyAdmin", companyAdminSchema);
export default CompanyAdmin;
import { startSession } from "mongoose";
import { AppError } from "../../classes/appError";
import { deleteSingleFileFromS3 } from "../../utils/deletes3Image";
import Auth from "../auth/auth.model";
import { TCompanyAdmin } from "./companyAdmin.interface";
import bcrypt from "bcrypt";
import config from "../../config";
import fs from "fs"
import generateOTP from "../../utils/generateOTP";
import { sendEmail } from "../../utils/sendEmail";
import CompanyAdmin from "./companyAdmin.model";
import QueryBuilder from "../../classes/queryBuilder";

const signUp = async (payload: TCompanyAdmin & { password: string }) => {
  const auth = await Auth.findOne({ email: payload.email, is_account_verified: true });
  if (auth) {
    if (payload.logo) deleteSingleFileFromS3(payload?.logo?.split(".com/")[1]);
    throw new AppError(400, "Email already exists!");
  }

  const session = await startSession();
  try {
    session.startTransaction();
    const { password, ...userData } = payload;
    // Create auth data
    const hashedPassword = await bcrypt.hash(
      password,
      Number(config.salt_rounds)
    );

    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(
      otp.toString(),
      Number(config.salt_rounds)
    );

    const otp_expires = new Date(Date.now() + 3 * 60 * 1000);

    const authData = {
      email: payload.email,
      password: hashedPassword,
      otp: hashedOtp,
      otp_expires,
      otp_attempts: 0,
    } as any;

    const newUser = await CompanyAdmin.findOneAndUpdate({ email: payload.email }, userData, { session, upsert: true, new: true });

    authData.user = newUser?._id
    authData.user_type = "CompanyAdmin"
    authData.role = "company_admin"
    await Auth.findOneAndUpdate({ email: payload.email }, authData, { session, upsert: true, new: true });

    if (newUser) {
      // send otp
      const emailTemplatePath = "./src/app/emailTemplates/otp.html";
      const subject = `Your OTP Code is Here - Site FLow`;
      const year = new Date().getFullYear().toString();
      fs.readFile(emailTemplatePath, "utf8", (err, data) => {
        if (err) throw new AppError(500, err.message || "Something went wrong");
        const emailContent = data
          .replace('{{otp}}', otp.toString())
          .replace('{{year}}', year);

        sendEmail(payload.email, subject, emailContent);
      })
    }

    await session.commitTransaction();
  } catch (err: any) {
    await session.abortTransaction();
    throw new AppError(500, err.message || "Something went wrong");
  } finally {
    session.endSession();
  }

};

const getCompanyAdminProfile = async (id: string) => {
  const companyAdmin = await Auth.findById(id);
  return companyAdmin;
}

const getAllCompanyAdmins = async (query: Record<string, any>) => {
  const searchableFields = [
    "name",
    "email",
    "gender",
    "age",
  ];

  const userQuery = new QueryBuilder(
    CompanyAdmin.find(),
    query
  )
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .selectFields();

  const meta = await userQuery.countTotal();
  const result = await userQuery.queryModel
  return { data: result, meta };
}

const getSingleCompanyAdmin = async (id: string) => {
  const result = await CompanyAdmin.findById(id);
  return result;
}

const updateCompanyAdminProfile = async (email: string, payload: Partial<TCompanyAdmin>) => {
  const companyAdmin = await CompanyAdmin.findOne({ email });
  const result = await CompanyAdmin.findByIdAndUpdate(companyAdmin?._id, payload, { new: true });
  if (result && payload?.logo && companyAdmin?.logo) deleteSingleFileFromS3(companyAdmin?.logo!.split(".com/")[1]);
  if (result && payload?.image && companyAdmin?.image) deleteSingleFileFromS3(companyAdmin?.image!.split(".com/")[1]);
  return result;
}

export const companyAdminServices = {
  signUp,
  getCompanyAdminProfile,
  getAllCompanyAdmins,
  getSingleCompanyAdmin,
  updateCompanyAdminProfile
};
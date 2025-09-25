import { startSession } from "mongoose";
import { AppError } from "../../classes/appError";
import Auth from "../auth/auth.model";
import { TCompanyAdmin } from "./companyAdmin.interface";
import bcrypt from "bcrypt";
import config from "../../config";
import fs from "fs";
import generateOTP from "../../utils/generateOTP";
import { sendEmail } from "../../utils/sendEmail";
import CompanyAdmin from "./companyAdmin.model";
import QueryBuilder from "../../classes/queryBuilder";
import { userRoles } from "../../constants/global.constant";
import { deleteFromS3, uploadToS3 } from "../../utils/awss3";
import { TFile } from "../../interface/file.interface";

const signUp = async (payload: TCompanyAdmin & { password: string }, file: TFile) => {
  const auth = await Auth.findOne({ email: payload.email, is_account_verified: true });

  if (auth) {
    throw new AppError(400, "User already exists with the email!");
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

    if (file) userData.logo = await uploadToS3(file);
    const newUser = await CompanyAdmin.findOneAndUpdate({ email: payload.email }, userData, { session, upsert: true, new: true });

    authData.user = newUser?._id;
    authData.user_type = "CompanyAdmin";
    authData.role = userRoles.companyAdmin;
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
    if (payload.logo) await deleteFromS3(payload.logo);
    throw new AppError(500, err.message || "Something went wrong");
  } finally {
    session.endSession();
  }

};

const getCompanyAdminProfile = async (id: string) => {
  const companyAdmin = await Auth.findById(id).select("user user_type role").populate("user");
  return companyAdmin;
}

const getAllCompanyAdmins = async (query: Record<string, any>) => {
  const searchableFields = [
    "name",
    "email",
    "gender",
    "age",
  ];
  query.user_type = "CompanyAdmin"
  const userQuery = new QueryBuilder(
    Auth.find(),
    query
  )
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .selectFields();

  const meta = await userQuery.countTotal();
  const result = await userQuery.queryModel
    .select("-password") //
    .populate({
      path: "user",
      select: "name email company_name image logo",
    });

  return { data: result, meta };
}

const getSingleCompanyAdmin = async (id: string) => {
  const result = await CompanyAdmin.findById(id);
  return result;
}

const updateCompanyAdminProfile = async (email: string, payload: Partial<TCompanyAdmin>, files: any) => {
  if (files?.logo.length) payload.logo = await uploadToS3(files.logo[0]);
  if (files?.image.length) payload.image = await uploadToS3(files.image[0]);

  const companyAdmin = await CompanyAdmin.findOne({ email });
  const result = await CompanyAdmin.findByIdAndUpdate(companyAdmin?._id, payload, { new: true });
  if (result && payload?.logo && companyAdmin?.logo) deleteFromS3(companyAdmin?.logo);
  if (result && payload?.image && companyAdmin?.image) deleteFromS3(companyAdmin?.image);
  return result;
}

export const companyAdminServices = {
  signUp,
  getCompanyAdminProfile,
  getAllCompanyAdmins,
  getSingleCompanyAdmin,
  updateCompanyAdminProfile
};
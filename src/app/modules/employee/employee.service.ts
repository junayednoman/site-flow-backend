import { startSession } from "mongoose";
import { AppError } from "../../classes/appError";
import Auth from "../auth/auth.model";
import { TEmployee } from "./employee.interface";
import bcrypt from "bcrypt";
import config from "../../config";
import { Employee } from "./employee.model";
import { userRoles } from "../../constants/global.constant";
import fs from "fs";
import { sendEmail } from "../../utils/sendEmail";
import { deleteSingleFileFromS3 } from "../../utils/deleteSingleFileFromS3";

const createEmployee = async (id: string, payload: TEmployee & { password: string }) => {
  payload.company_admin = id;
  const exists = await Auth.findOne({ email: payload.email });
  if (exists) throw new AppError(400, "Email already exists!");
  const session = await startSession();

  try {
    session.startTransaction();

    const { password, ...user } = payload;
    const hashedPassword = await bcrypt.hash(password, Number(config.salt_rounds));

    const authData = {
      email: payload.email,
      password: hashedPassword,
      is_account_verified: true,
    } as any;

    const newUser = await Employee.create([user], { session });
    authData.user = newUser[0]._id;
    authData.user_type = "Employee";
    authData.role = userRoles.employee;

    await Auth.create([authData], { session });

    if (newUser) {
      // send otp
      const emailTemplatePath = "./src/app/emailTemplates/informEmployee.html";
      const subject = `You have been added as a ${payload.type} - Site FLow`;
      const year = new Date().getFullYear().toString();
      fs.readFile(emailTemplatePath, "utf8", (err, data) => {
        if (err) throw new AppError(500, err.message || "Something went wrong");
        const emailContent = data
          .replace('{{name}}', payload.name)
          .replace('{{employee_type}}', payload.type)
          .replace('{{year}}', year);

        sendEmail(payload.email, subject, emailContent);
      })
    }
    await session.commitTransaction();
  } catch (error: any) {
    await session.abortTransaction();
    throw new AppError(400, error?.message || "Failed to create employee!");
  } finally {
    session.endSession()
  }
}

const getAllCompanyEmployees = async (id: string) => {
  const employees = await Employee.find({ company_admin: id });
  return employees;
}

const getSingleEmployee = async (id: string) => {
  const employee = await Employee.findById(id);
  return employee;
}

const getEmployeeProfile = async (email: string) => {
  const employee = await Employee.findOne({ email });
  return employee;
}

const updateEmployeeProfile = async (email: string, payload: TEmployee, file?: any) => {
  if (file) payload.image = file.location;
  const employee = await Employee.findOne({ email });
  if (!employee) {
    return await deleteSingleFileFromS3(file?.key);
  }
  const updatedEmployee = await Employee.findOneAndUpdate({ email }, payload, { new: true });
  if (updatedEmployee) {
    await deleteSingleFileFromS3(employee?.image?.split(".com/")[1] as string);
  }
  return updatedEmployee;
}

const deleteEmployee = async (id: string) => {
  const employee = await Employee.findById(id);
  if (!employee) throw new AppError(400, "Invalid employee id!");
  const auth = await Auth.findOne({ email: employee.email, is_deleted: false });
  if (!auth) throw new AppError(400, "Invalid employee id!");
  return await Auth.findOneAndUpdate(auth._id, { is_deleted: true }, { new: true });
}

const employeeService = {
  createEmployee,
  getAllCompanyEmployees,
  getSingleEmployee,
  getEmployeeProfile,
  updateEmployeeProfile,
  deleteEmployee
};

export default employeeService;
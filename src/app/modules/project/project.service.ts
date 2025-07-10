import { AppError } from "../../classes/appError";
import mongoose, { ObjectId, startSession } from "mongoose";
import { userRoles } from "../../constants/global.constant";
import { sendEmail } from "../../utils/sendEmail";
import Auth from "../auth/auth.model";
import { Employee } from "../employee/employee.model";
import { TProjectType } from "./project.interface";
import Project from "./project.model";
import fs from "fs";
import Equipment from "../equipment/equipment.model";
import Workforce from "../workforce/workforce.model";
import DayWork from "../dayWork/dayWork.model";
import AggregationBuilder from "../../classes/AggregationBuilder";

const createProject = async (id: string, payload: TProjectType) => {
  const supervisor = await Employee.findById(payload.supervisor);
  if (!supervisor) throw new AppError(400, "Invalid supervisor id!");
  const manager = await Employee.findById(payload.manager);
  if (!manager) throw new AppError(400, "Invalid manager id!");

  const supervisorAuth = await Auth.findOne({ email: supervisor.email, role: userRoles.employee, is_deleted: false, is_blocked: false });
  const managerAuth = await Auth.findOne({ email: manager.email, role: userRoles.employee, is_deleted: false, is_blocked: false });
  payload.supervisor = supervisorAuth?._id as unknown as ObjectId;
  payload.manager = managerAuth?._id as unknown as ObjectId;

  payload.company_admin = id;
  const result = await Project.create(payload);

  // send email to supervisor & manager
  if (result) {
    const emailTemplatePath = "./src/app/emailTemplates/notifyProjectAssignment.html";
    const year = new Date().getFullYear().toString();
    // for supervisor
    const subject = `You have been assigned as supervisor for ${payload.name} - Site Flow`
    fs.readFile(emailTemplatePath, "utf8", (err, data) => {
      if (err) throw new AppError(500, err.message || "Something went wrong");
      const emailContent = data
        .replace('{{name}}', supervisor.name)
        .replace('{{employee_type}}', "supervisor")
        .replace('{{project_name}}', payload.name)
        .replace('{{year}}', year);

      sendEmail(supervisor.email, subject, emailContent);
    })

    // for manager
    const managerSubject = `You have been assigned as manager for ${payload.name} - Site Flow`
    fs.readFile(emailTemplatePath, "utf8", (err, data) => {
      if (err) throw new AppError(500, err.message || "Something went wrong");
      const emailContent = data
        .replace('{{name}}', manager.name)
        .replace('{{employee_type}}', "manager")
        .replace('{{project_name}}', payload.name)
        .replace('{{year}}', year);

      sendEmail(manager.email, managerSubject, emailContent);
    })
  }
  return result;
}

const getMyProjects = async (query: Record<string, any>, userRole: "employee" | "company_admin", userId: string) => {
  const searchableFields = ["name", "client_name"];

  // Convert userId to ObjectId
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Role based query
  let roleQuery = {};
  if (userRole === userRoles.companyAdmin) {
    roleQuery = { company_admin: userObjectId };
  } else if (userRole === userRoles.employee) {
    roleQuery = { $or: [{ supervisor: userObjectId }, { manager: userObjectId }] };
  }

  // Merge roleQuery into the query object to ensure it’s applied in all $match stages
  const combinedQuery = { ...roleQuery, ...query };

  const projectQuery = new AggregationBuilder(Project, [
    {
      $match: roleQuery,
    },
    {
      $lookup: {
        from: "dayworks",
        localField: "_id",
        foreignField: "project",
        as: "dayWorks",
      },
    },
    {
      $lookup: {
        from: "sitediaries",
        localField: "_id",
        foreignField: "project",
        as: "siteDiary",
      }
    },
    {
      $project: {
        name: 1,
        location: 1,
        company_admin: 1,
        totalDayWork: { $size: "$dayWorks" },
        totalSiteDiary: { $size: "$siteDiary" },
        dayWorkImages: {
          $reduce: {
            input: "$dayWorks",
            initialValue: [],
            in: {
              $concatArrays: [
                "$$value",
                [{ $ifNull: ["$$this.image", null] }]
              ]
            }
          }
        },
      },
    },
  ], combinedQuery)
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .selectFields();

  const meta = await projectQuery.countTotal();
  const result = await projectQuery.execute();

  // Filter out null values from dayWorkImages
  // const cleanedResult = result.map((project: any) => ({
  //   ...project,
  //   dayWorkImages: project.dayWorkImages.filter((img: any) => img !== null),
  // }));

  return { data: result, meta };
};

const getSingleProject = async (id: string, userRole: "employee" | "company_admin", userId: string) => {
  // Role based query
  let roleQuery = {};
  if (userRole == userRoles.companyAdmin) {
    roleQuery = { company_admin: userId }
  } else if (userRole == userRoles.employee) {
    roleQuery = { employees: { $in: [userId] } }
  }

  const result = await Project.findOne({ _id: id, ...roleQuery });
  return result;
}

const updateProject = async (id: string, userId: string, payload: TProjectType) => {
  const project = await Project.findById(id);
  if (!project) throw new AppError(400, "Invalid project id!");
  if (project.company_admin.toString() !== userId) throw new AppError(401, "Unauthorized!");
  const result = await Project.findByIdAndUpdate(id, payload, { new: true });
  return result;
}

const deleteProject = async (id: string, userId: string) => {
  const project = await Project.findById(id);
  if (!project) throw new AppError(400, "Invalid project id!");
  if (project.company_admin.toString() !== userId) throw new AppError(401, "Unauthorized!");
  const session = await startSession();
  try {
    session.startTransaction();

    const result = await Project.findByIdAndDelete(id, { session });
    await Equipment.findOneAndDelete({ project: id }, { session });
    await Workforce.findOneAndDelete({ project: id }, { session });
    await DayWork.findOneAndDelete({ project: id }, { session });
    await session.commitTransaction();
    return result;
  } catch (error: any) {
    await session.abortTransaction();
    throw new AppError(500, error.message || "Something went wrong!");
  }
  finally {
    session.endSession();
  }
}

const projectService = { createProject, getMyProjects, getSingleProject, updateProject, deleteProject };
export default projectService;
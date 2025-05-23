import { AppError } from "../../classes/appError";
import QueryBuilder from "../../classes/queryBuilder";
import { userRoles } from "../../constants/global.constant";
import { TProjectType } from "./project.interface";
import Project from "./project.model";

const createProject = async (id: string, payload: TProjectType) => {
  payload.company_admin = id;
  const result = await Project.create(payload);
  return result;
}

const getAllProjects = async (query: Record<string, any>, userRole: "employee" | "company_admin", userId: string) => {
  const searchableFields = [
    "name",
    "client_name"
  ];

  // Role based query
  let roleQuery = {};
  if (userRole == userRoles.companyAdmin) {
    roleQuery = { company_admin: userId }
  } else if (userRole == userRoles.employee) {
    roleQuery = { employees: { $in: [userId] } }
  }
  const projectQuery = new QueryBuilder(
    Project.find(roleQuery),
    query
  )
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .selectFields();

  const meta = await projectQuery.countTotal();
  const result = await projectQuery.queryModel
  return { data: result, meta };
}

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
  const result = await Project.findByIdAndDelete(id);
  return result;
}

const projectService = { createProject, getAllProjects, getSingleProject, updateProject, deleteProject };
export default projectService;
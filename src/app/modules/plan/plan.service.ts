import { ObjectId } from "mongoose";
import { AppError } from "../../classes/appError";
import { userRoles } from "../../constants/global.constant";
import Project from "../project/project.model";
import { TPlan } from "./plan.interface";
import Plan from "./plan.model";
import QueryBuilder from "../../classes/queryBuilder";
import Workforce from "../workforce/workforce.model";
import Equipment from "../equipment/equipment.model";
import checkProjectAuthorization from "../../utils/checkProjectAuthorization";

const createPlan = async (userId: string, payload: TPlan) => {
  const project = await Project.findById(payload.project);

  if (!project) {
    throw new AppError(400, "Invalid project ID!");
  }

  // Allow only if user is involved in this project (supervisor or manager)
  checkProjectAuthorization(project, userId, [userRoles.employee]);

  // Set createdBy to the userId
  payload.author = userId as unknown as ObjectId;

  if (payload.workforces) {
    for (const workforceData of payload.workforces) {
      const existingWorkforce = await Workforce.findById(workforceData.workforce);
      if (!existingWorkforce) {
        throw new AppError(400, `Invalid workforce ID: ${workforceData.workforce}`);
      }
    }
  }

  if (payload.equipments) {
    for (const equipmentData of payload.equipments) {
      const existingEquipment = await Equipment.findById(equipmentData.equipment);
      if (!existingEquipment) {
        throw new AppError(400, `Invalid equipment ID: ${equipmentData.equipment}`);
      }
    }
  }

  const plan = await Plan.create(payload);
  return plan
};

const getPlanById = async (id: string, userId: string) => {
  const plan = await Plan.findById(id)
    .populate("project", "name supervisor manager")
    .populate("author", "email")
    .populate("workforces.workforce", "name")
    .populate("equipments.equipment", "name");

  // Check if user is authorized (employee or companyAdmin of the project)
  const project = plan?.project as any;
  if (project) {
    checkProjectAuthorization(project, userId, [userRoles.companyAdmin, userRoles.employee]);
  }

  return plan;
};

const getProjectsAllPlans = async (query: Record<string, any>, userId: string, projectId: string) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new AppError(400, "Invalid project ID!");
  }

  // Allow only if user is involved in this project
  checkProjectAuthorization(project, userId, [userRoles.companyAdmin, userRoles.employee]);

  const searchableFields = ["name", "description"];

  const planQuery = new QueryBuilder(
    Plan.find({ project: projectId }).populate("project", "name").populate("author", "email"),
    query
  )
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .selectFields();

  const meta = await planQuery.countTotal();
  const result = await planQuery.queryModel;
  return { data: result, meta };
};

const removeWorkforceFromPlan = async (planId: string, workforceId: string, userId: string) => {
  const plan = await Plan.findById(planId);
  if (!plan) {
    throw new AppError(404, "Plan not found!");
  }

  // Allow only if userId matches supervisor or manager
  const project = plan.project as any;
  checkProjectAuthorization(project, userId, [userRoles.employee]);

  const updated = await Plan.findByIdAndUpdate(planId, { $pull: { workforces: { workforce: workforceId } } }, { new: true });
  return updated;
}

const updatePlan = async (id: string, userId: string, payload: Partial<TPlan>) => {
  const existing = await Plan.findById(id).populate("project", "company_admin supervisor manager");
  if (!existing) {
    throw new AppError(404, "Plan not found!");
  }

  const project = existing.project as any;
  // Allow only if userId matches supervisor or manager
  if (
    userId !== project.supervisor.toString() &&
    userId !== project.manager.toString()
  ) {
    throw new AppError(401, "Unauthorized!");
  }

  const updated = await Plan.findByIdAndUpdate(id, payload, { new: true });
  return updated;
};

const deletePlan = async (id: string, userId: string) => {
  const existing = await Plan.findById(id).populate("project", "company_admin supervisor manager");
  if (!existing) {
    throw new AppError(404, "Plan not found!");
  }

  const project = existing.project as any;
  // Allow only if userId matches supervisor or manager
  if (
    userId !== project.supervisor.toString() &&
    userId !== project.manager.toString()
  ) {
    throw new AppError(401, "Unauthorized!");
  }

  const deleted = await Plan.findByIdAndDelete(id);
  return deleted;
};

export default {
  createPlan,
  getPlanById,
  getProjectsAllPlans,
  removeWorkforceFromPlan,
  updatePlan,
  deletePlan,
};
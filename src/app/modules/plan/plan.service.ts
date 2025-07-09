import Plan from "./plan.model";
import { AppError } from "../../classes/appError";
import { TPlan, TTaskPayload } from "./plan.interface";
import Project from "../project/project.model";
import Workforce from "../workforce/workforce.model";
import Equipment from "../equipment/equipment.model";
import QueryBuilder from "../../classes/queryBuilder";
import { ObjectId, startSession } from "mongoose";
import checkProjectAuthorization from "../../utils/checkProjectAuthorization";
import { userRoles } from "../../constants/global.constant";

const createPlan = async (userId: string, payload: TPlan) => {
  payload.added_by = userId as unknown as ObjectId;
  const session = await startSession();
  session.startTransaction();

  try {
    const project = await Project.findById(payload.project).session(session);
    if (!project) throw new AppError(400, "Invalid project ID!");

    checkProjectAuthorization(project, userId, [userRoles.employee]);

    // Map workforce and equipment IDs to their total requested quantities across all tasks
    const workforceTotals: Record<string, number> = {};
    const equipmentTotals: Record<string, number> = {};

    for (const task of payload.tasks) {
      for (const workforceData of task.workforces) {
        const workforceId = workforceData.workforce.toString();
        workforceTotals[workforceId] = (workforceTotals[workforceId] || 0) + workforceData.quantity;
      }

      for (const equipmentData of task.equipments) {
        const equipmentId = equipmentData.equipment.toString();
        equipmentTotals[equipmentId] = (equipmentTotals[equipmentId] || 0) + equipmentData.quantity;
      }
    }

    // Validate total workforce quantities
    for (const [workforceId, totalQuantity] of Object.entries(workforceTotals)) {
      const existingWorkforce = await Workforce.findById(workforceId).session(session);
      if (!existingWorkforce) throw new AppError(400, `Invalid workforce ID: ${workforceId}`);
      if (existingWorkforce.project.toString() !== payload.project.toString()) {
        throw new AppError(400, `Workforce ${workforceId} is not associated with project ${payload.project}`);
      }
      if (totalQuantity > existingWorkforce.quantity) {
        throw new AppError(400, `Insufficient total workforce quantity available for ${workforceId}: requested ${totalQuantity}, available ${existingWorkforce.quantity}`);
      }
    }

    // Validate total equipment quantities
    for (const [equipmentId, totalQuantity] of Object.entries(equipmentTotals)) {
      const existingEquipment = await Equipment.findById(equipmentId).session(session);
      if (!existingEquipment) throw new AppError(400, `Invalid equipment ID: ${equipmentId}`);
      if (existingEquipment.project.toString() !== payload.project.toString()) {
        throw new AppError(400, `Equipment ${equipmentId} is not associated with project ${equipmentId}`);
      }
      if (totalQuantity > existingEquipment.quantity) {
        throw new AppError(400, `Insufficient total equipment quantity available for ${equipmentId}: requested ${totalQuantity}, available ${existingEquipment.quantity}`);
      }
    }

    const plan = await Plan.create([payload], { session });
    await session.commitTransaction();
    return plan;
  } catch (error: any) {
    await session.abortTransaction();
    throw new AppError(500, error.message || "Error creating Plan!");
  } finally {
    session.endSession();
  }
};

const getPlanById = async (id: string, userId: string) => {
  const plan = await Plan.findById(id).populate([
    { path: "added_by", select: "user_type user", populate: { path: "user", select: "name type" } },
    { path: "project", select: "name" },
    { path: "tasks.workforces.workforce", select: "name" },
    { path: "tasks.equipments.equipment", select: "name" },
  ]);

  if (!plan) throw new AppError(400, "Invalid plan id!");
  const project = await Project.findById(plan.project);

  checkProjectAuthorization(project!, userId, [userRoles.companyAdmin, userRoles.employee]);

  return plan;
};

const getProjectPlans = async (query: Record<string, any>, projectId: string, userId: string) => {
  const project = await Project.findById(projectId);
  if (!project) throw new AppError(400, "Invalid project id!");

  checkProjectAuthorization(project, userId, [userRoles.companyAdmin, userRoles.employee]);

  const searchableFields = ["name"];
  const planQuery = new QueryBuilder(Plan.find({ project: projectId }), query)
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .selectFields();

  const meta = await planQuery.countTotal();
  const result = await planQuery.queryModel;
  return { data: result, meta };
};

const updatePlan = async (id: string, userId: string, payload: Partial<TPlan>) => {
  const existing = await Plan.findById(id).populate("project", "company_admin supervisor manager");
  if (!existing) throw new AppError(400, "Invalid plan id!");

  const project = existing.project as any;
  checkProjectAuthorization(project, userId, [userRoles.employee]);

  const session = await startSession();
  try {
    session.startTransaction();

    if (payload.tasks && payload.tasks.length > 0) {
      for (const task of payload.tasks) {
        for (const workforceData of task.workforces) {
          const existingWorkforce = await Workforce.findById(workforceData.workforce).session(session);
          if (!existingWorkforce) throw new AppError(400, `Invalid workforce ID: ${workforceData.workforce}`);
          if (existingWorkforce.project.toString() !== existing.project.toString()) {
            throw new AppError(400, `Workforce ${workforceData.workforce} is not associated with project ${existing.project}`);
          }
          const previousWorkforce = existing.tasks
            .flatMap(t => t.workforces)
            .find(wf => wf.workforce.toString() === workforceData.workforce.toString());
          if (previousWorkforce) {
            const netChange = workforceData.quantity - previousWorkforce.quantity;
            if (netChange > 0 && netChange > existingWorkforce.quantity) {
              throw new AppError(400, `Insufficient workforce quantity available: ${workforceData.workforce}`);
            }
          } else if (workforceData.quantity > existingWorkforce.quantity) {
            throw new AppError(400, `Insufficient workforce quantity available: ${workforceData.workforce}`);
          }
        }

        for (const equipmentData of task.equipments) {
          const existingEquipment = await Equipment.findById(equipmentData.equipment).session(session);
          if (!existingEquipment) throw new AppError(400, `Invalid equipment ID: ${equipmentData.equipment}`);
          if (existingEquipment.project.toString() !== existing.project.toString()) {
            throw new AppError(400, `Equipment ${equipmentData.equipment} is not associated with project ${existing.project}`);
          }
          const previousEquipment = existing.tasks
            .flatMap(t => t.equipments)
            .find(eq => eq.equipment.toString() === equipmentData.equipment.toString());
          if (previousEquipment) {
            const netChange = equipmentData.quantity - previousEquipment.quantity;
            if (netChange > 0 && netChange > existingEquipment.quantity) {
              throw new AppError(400, `Insufficient equipment quantity available: ${equipmentData.equipment}`);
            }
          } else if (equipmentData.quantity > existingEquipment.quantity) {
            throw new AppError(400, `Insufficient equipment quantity available: ${equipmentData.equipment}`);
          }
        }
      }
    }

    const updatedPlan = await Plan.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    await session.commitTransaction();
    return updatedPlan;
  } catch (error: any) {
    await session.abortTransaction();
    throw new AppError(500, error.message || "Error updating Plan!");
  } finally {
    session.endSession();
  }
};

const deletePlan = async (id: string) => {
  const existing = await Plan.findById(id);
  if (!existing) throw new AppError(400, "Invalid plan id!");

  await Plan.findByIdAndDelete(id);
  return existing;
};

const removePlanWorkforce = async (planId: string, workforceId: string, taskIndex: number) => {
  const plan = await Plan.findById(planId);
  if (!plan) throw new AppError(400, "Invalid plan id!");
  if (taskIndex < 0 || taskIndex >= plan.tasks.length) throw new AppError(400, "Invalid task index!");

  const task = plan.tasks[taskIndex];
  const workforceToRemove = task.workforces.find(wf => wf.workforce.toString() === workforceId);
  if (!workforceToRemove) throw new AppError(400, `Workforce ID ${workforceId} not found in task`);

  task.workforces = task.workforces.filter(wf => wf.workforce.toString() !== workforceId);
  await plan.save();
  return plan;
};

const removePlanEquipment = async (planId: string, equipmentId: string, taskIndex: number) => {
  const plan = await Plan.findById(planId);
  if (!plan) throw new AppError(400, "Invalid plan id!");
  if (taskIndex < 0 || taskIndex >= plan.tasks.length) throw new AppError(400, "Invalid task index!");

  const task = plan.tasks[taskIndex];
  const equipmentToRemove = task.equipments.find(eq => eq.equipment.toString() === equipmentId);
  if (!equipmentToRemove) throw new AppError(400, `Equipment ID ${equipmentId} not found in task`);

  task.equipments = task.equipments.filter(eq => eq.equipment.toString() !== equipmentId);
  await plan.save();
  return plan;
};

const addTask = async (planId: string, task: TTaskPayload) => {
  const plan = await Plan.findById(planId);
  if (!plan) throw new AppError(400, "Invalid plan id!");

  const session = await startSession();
  try {
    session.startTransaction();

    const normalizedWorkforces = task.workforces || [];
    if (normalizedWorkforces.length > 0) {
      for (const workforceData of normalizedWorkforces) {
        const existingWorkforce = await Workforce.findById(workforceData.workforce).session(session);
        if (!existingWorkforce) throw new AppError(400, `Invalid workforce ID: ${workforceData.workforce}`);
        if (existingWorkforce.project.toString() !== plan.project.toString()) {
          throw new AppError(400, `Workforce ${workforceData.workforce} is not associated with project ${plan.project}`);
        }
        if (workforceData.quantity > existingWorkforce.quantity) {
          throw new AppError(400, `Insufficient workforce quantity available: ${workforceData.workforce}`);
        }
      }
    }

    const normalizedEquipments = task.equipments || [];
    if (normalizedEquipments.length > 0) {
      for (const equipmentData of normalizedEquipments) {
        const existingEquipment = await Equipment.findById(equipmentData.equipment).session(session);
        if (!existingEquipment) throw new AppError(400, `Invalid equipment ID: ${equipmentData.equipment}`);
        if (existingEquipment.project.toString() !== plan.project.toString()) {
          throw new AppError(400, `Equipment ${equipmentData.equipment} is not associated with project ${plan.project}`);
        }
        if (equipmentData.quantity > existingEquipment.quantity) {
          throw new AppError(400, `Insufficient equipment quantity available: ${equipmentData.equipment}`);
        }
      }
    }

    plan.tasks.push({
      name: task.name,
      workforces: normalizedWorkforces,
      equipments: normalizedEquipments,
    });
    await plan.save({ session });
    await session.commitTransaction();
    return plan;
  } catch (error: any) {
    await session.abortTransaction();
    throw new AppError(500, error.message || "Error adding task!");
  } finally {
    session.endSession();
  }
};

const removeTask = async (planId: string, taskIndex: number) => {
  const plan = await Plan.findById(planId);
  if (!plan) throw new AppError(400, "Invalid plan id!");
  if (taskIndex < 0 || taskIndex >= plan.tasks.length) throw new AppError(400, "Invalid task index!");

  plan.tasks.splice(taskIndex, 1);
  await plan.save();
  return plan;
};

export default {
  createPlan,
  getPlanById,
  getProjectPlans,
  updatePlan,
  deletePlan,
  removePlanWorkforce,
  removePlanEquipment,
  addTask,
  removeTask
};
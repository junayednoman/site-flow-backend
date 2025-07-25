import DayWork from "./dayWork.model";
import { AppError } from "../../classes/appError";
import { TDayWork, TTaskPayload } from "./dayWork.interface";
import Project from "../project/project.model";
import Workforce from "../workforce/workforce.model";
import Equipment from "../equipment/equipment.model";
import mongoose, { ObjectId, startSession } from "mongoose";
import { deleteSingleFileFromS3 } from "../../utils/deleteSingleFileFromS3";
import checkProjectAuthorization from "../../utils/checkProjectAuthorization";
import { userRoles } from "../../constants/global.constant";
import AggregationBuilder from "../../classes/AggregationBuilder";

const createDayWork = async (userId: string, payload: TDayWork, file?: any) => {
  payload.added_by = userId as unknown as ObjectId;
  if (file) payload.image = file.location;
  const session = await startSession();
  session.startTransaction();

  try {
    const project = await Project.findById(payload.project).session(session);
    if (!project) {
      await deleteSingleFileFromS3(file?.key);
      throw new AppError(400, "Invalid project ID!");
    }

    if (
      userId !== project.company_admin.toString() &&
      userId !== project.supervisor.toString() &&
      userId !== project.manager.toString()
    ) {
      await deleteSingleFileFromS3(file?.key);
      throw new AppError(401, "Unauthorized!");
    }

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

    // Validate and deduct total workforce quantities
    for (const [workforceId, totalQuantity] of Object.entries(workforceTotals)) {
      const existingWorkforce = await Workforce.findById(workforceId).session(session);
      if (!existingWorkforce) {
        await deleteSingleFileFromS3(file?.key);
        throw new AppError(400, `Invalid workforce ID: ${workforceId}`);
      }
      if (existingWorkforce.project.toString() !== payload.project.toString()) {
        await deleteSingleFileFromS3(file?.key);
        throw new AppError(400, `Workforce ${workforceId} is not associated with project ${payload.project}`);
      }
      if (totalQuantity > existingWorkforce.quantity) {
        await deleteSingleFileFromS3(file?.key);
        throw new AppError(400, `Insufficient total workforce quantity available for ${workforceId}: requested ${totalQuantity}, available ${existingWorkforce.quantity}`);
      }
      existingWorkforce.quantity -= totalQuantity;
      await existingWorkforce.save({ session });
    }

    // Validate and deduct total equipment quantities
    for (const [equipmentId, totalQuantity] of Object.entries(equipmentTotals)) {
      const existingEquipment = await Equipment.findById(equipmentId).session(session);
      if (!existingEquipment) {
        await deleteSingleFileFromS3(file?.key);
        throw new AppError(400, `Invalid equipment ID: ${equipmentId}`);
      }
      if (existingEquipment.project.toString() !== payload.project.toString()) {
        await deleteSingleFileFromS3(file?.key);
        throw new AppError(400, `Equipment ${equipmentId} is not associated with project ${payload.project}`);
      }
      if (totalQuantity > existingEquipment.quantity) {
        await deleteSingleFileFromS3(file?.key);
        throw new AppError(400, `Insufficient total equipment quantity available for ${equipmentId}: requested ${totalQuantity}, available ${existingEquipment.quantity}`);
      }
      existingEquipment.quantity -= totalQuantity;
      await existingEquipment.save({ session });
    }

    const dayWork = await DayWork.create([payload], { session });
    await session.commitTransaction();
    return dayWork;
  } catch (error: any) {
    await session.abortTransaction();
    await deleteSingleFileFromS3(file?.key);
    throw new AppError(500, error.message || "Error creating DayWork!");
  } finally {
    session.endSession();
  }
};

const getDayWorkById = async (id: string) => {
  const dayWork = await DayWork.findById(id).populate([
    {
      path: "added_by",
      select: "user_type user",
      populate: {
        path: "user",
        select: "name type",
      },
    },
    { path: "project", select: "name" },
    { path: "tasks.workforces.workforce", select: "name" },
    { path: "tasks.equipments.equipment", select: "name" },
  ]);
  return dayWork;
};

const getProjectDayWorks = async (query: Record<string, any>, projectId: string, userId: string) => {
  const project = await Project.findById(projectId);
  if (!project) throw new AppError(400, "Invalid project id!");

  // Allow only if userId matches any of the roles, else throw Unauthorized
  checkProjectAuthorization(project, userId, [userRoles.companyAdmin, userRoles.employee]);

  const searchableFields = ["name", "description", "materials", "location", "comment", "delay"];
  const dayWorkQuery = new AggregationBuilder(DayWork, [
    { $match: { project: new mongoose.Types.ObjectId(projectId) } },
    {
      $addFields: {
        totalWorkforces: {
          $sum: {
            $map: {
              input: "$tasks",
              as: "task",
              in: {
                $sum: {
                  $map: {
                    input: "$$task.workforces",
                    as: "w",
                    in: "$$w.quantity"
                  }
                }
              }
            }
          }
        },
        totalEquipments: {
          $sum: {
            $map: {
              input: "$tasks",
              as: "task",
              in: {
                $sum: {
                  $map: {
                    input: "$$task.equipments",
                    as: "e",
                    in: "$$e.quantity"
                  }
                }
              }
            }
          }
        }
      }
    },
    {
      $project: {
        name: 1,
        duration: 1,
        totalWorkforces: 1,
        totalEquipments: 1
      }
    }
  ])
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .selectFields();


  const meta = await dayWorkQuery.countTotal();
  const result = await dayWorkQuery.execute();
  return { data: result, meta };
};

const updateDayWork = async (id: string, userId: string, payload: Partial<TDayWork>, file?: any) => {
  const existing = await DayWork.findById(id).populate("project", "company_admin supervisor manager");
  if (!existing) {
    throw new AppError(400, "Invalid day-work id!");
  }

  const project = existing.project as any;
  if (
    userId !== project.company_admin.toString() &&
    userId !== project.supervisor.toString() &&
    userId !== project.manager.toString()
  ) {
    await deleteSingleFileFromS3(file?.key);
    throw new AppError(401, "Unauthorized");
  }

  if (file) payload.image = file.location;

  const session = await startSession();
  try {
    session.startTransaction();

    if (payload.tasks && payload.tasks.length > 0) {
      for (const task of payload.tasks) {
        for (const workforceData of task.workforces) {
          const existingWorkforce = await Workforce.findById(workforceData.workforce).session(session);
          if (!existingWorkforce) {
            await deleteSingleFileFromS3(file?.key);
            throw new AppError(400, `Invalid workforce ID: ${workforceData.workforce}`);
          }
          if (existingWorkforce.project.toString() !== existing.project.toString()) {
            await deleteSingleFileFromS3(file?.key);
            throw new AppError(400, `Workforce ${workforceData.workforce} is not associated with project ${existing.project}`);
          }
          const previousWorkforce = existing.tasks
            .flatMap(t => t.workforces)
            .find(wf => wf.workforce.toString() === workforceData.workforce.toString());
          if (previousWorkforce) {
            if (previousWorkforce.quantity < workforceData.quantity) {
              if (workforceData.quantity - previousWorkforce.quantity > existingWorkforce.quantity) {
                await deleteSingleFileFromS3(file?.key);
                throw new AppError(400, `Insufficient workforce quantity: ${workforceData.workforce}`);
              }
              existingWorkforce.quantity -= workforceData.quantity - previousWorkforce.quantity;
            } else if (previousWorkforce.quantity > workforceData.quantity) {
              existingWorkforce.quantity += previousWorkforce.quantity - workforceData.quantity;
            }
            await existingWorkforce.save({ session });
          }
        }

        for (const equipmentData of task.equipments) {
          const existingEquipment = await Equipment.findById(equipmentData.equipment).session(session);
          if (!existingEquipment) {
            await deleteSingleFileFromS3(file?.key);
            throw new AppError(400, `Invalid equipment ID: ${equipmentData.equipment}`);
          }
          if (existingEquipment.project.toString() !== existing.project.toString()) {
            await deleteSingleFileFromS3(file?.key);
            throw new AppError(400, `Equipment ${equipmentData.equipment} is not associated with project ${existing.project}`);
          }
          const previousEquipment = existing.tasks
            .flatMap(t => t.equipments)
            .find(eq => eq.equipment.toString() === equipmentData.equipment.toString());
          if (previousEquipment) {
            if (previousEquipment.quantity < equipmentData.quantity) {
              if (equipmentData.quantity - previousEquipment.quantity > existingEquipment.quantity) {
                await deleteSingleFileFromS3(file?.key);
                throw new AppError(400, `Insufficient equipment quantity: ${equipmentData.equipment}`);
              }
              existingEquipment.quantity -= equipmentData.quantity - previousEquipment.quantity;
            } else if (previousEquipment.quantity > equipmentData.quantity) {
              existingEquipment.quantity += previousEquipment.quantity - equipmentData.quantity;
            }
            await existingEquipment.save({ session });
          }
        }
      }
    }

    const updatedDayWork = await DayWork.findByIdAndUpdate(id, payload, { new: true });
    if (updatedDayWork && existing.image) await deleteSingleFileFromS3(existing.image!.split(".com/")[1]);
    await session.commitTransaction();
    return updatedDayWork;
  } catch (error: any) {
    await session.abortTransaction();
    await deleteSingleFileFromS3(file?.key);
    throw new AppError(500, error.message || "Error updating DayWork!");
  } finally {
    session.endSession();
  }
};

const addDelay = async (dayWorkId: string, userId: string, delay: string) => {
  const dayWork = await DayWork.findById(dayWorkId).populate("project", "company_admin supervisor manager");
  if (!dayWork) throw new AppError(400, "Invalid day-work id!");

  const project = dayWork.project as any;
  checkProjectAuthorization(project, userId, [userRoles.employee])

  dayWork.delay = delay;
  await dayWork.save();
  return dayWork;
};

const addComment = async (dayWorkId: string, userId: string, comment: string) => {
  const dayWork = await DayWork.findById(dayWorkId).populate("project", "company_admin supervisor manager");
  if (!dayWork) throw new AppError(400, "Invalid day-work id!");

  const project = dayWork.project as any;
  checkProjectAuthorization(project, userId, [userRoles.companyAdmin])

  dayWork.comment = comment;
  await dayWork.save();
  return dayWork;
};

const addTask = async (dayWorkId: string, task: TTaskPayload) => {
  const dayWork = await DayWork.findById(dayWorkId);
  if (!dayWork) throw new AppError(400, "Invalid day-work id!");

  const session = await startSession();
  try {
    session.startTransaction();

    const normalizedWorkforces = task.workforces || [];
    if (normalizedWorkforces.length > 0) {
      for (const workforceData of normalizedWorkforces) {
        const existingWorkforce = await Workforce.findById(workforceData.workforce).session(session);
        if (!existingWorkforce) throw new AppError(400, `Invalid workforce ID: ${workforceData.workforce}`);
        if (existingWorkforce.project.toString() !== dayWork.project.toString()) {
          throw new AppError(400, `Workforce ${workforceData.workforce} is not associated with project ${dayWork.project}`);
        }
        if (workforceData.quantity > existingWorkforce.quantity) throw new AppError(400, `Insufficient workforce quantity: ${workforceData.workforce}`);
        existingWorkforce.quantity -= workforceData.quantity;
        await existingWorkforce.save({ session });
      }
    }

    const normalizedEquipments = task.equipments || [];
    if (normalizedEquipments.length > 0) {
      for (const equipmentData of normalizedEquipments) {
        const existingEquipment = await Equipment.findById(equipmentData.equipment).session(session);
        if (!existingEquipment) throw new AppError(400, `Invalid equipment ID: ${equipmentData.equipment}`);
        if (existingEquipment.project.toString() !== dayWork.project.toString()) {
          throw new AppError(400, `Equipment ${equipmentData.equipment} is not associated with project ${dayWork.project}`);
        }
        if (equipmentData.quantity > existingEquipment.quantity) throw new AppError(400, `Insufficient equipment quantity: ${equipmentData.equipment}`);
        existingEquipment.quantity -= equipmentData.quantity;
        await existingEquipment.save({ session });
      }
    }

    dayWork.tasks.push({
      name: task.name,
      workforces: normalizedWorkforces,
      equipments: normalizedEquipments,
    });
    await dayWork.save({ session });
    await session.commitTransaction();
    return dayWork;
  } catch (error: any) {
    await session.abortTransaction();
    throw new AppError(500, error.message || "Error adding task!");
  } finally {
    session.endSession();
  }
};

const removeTask = async (dayWorkId: string, taskIndex: number) => {
  const dayWork = await DayWork.findById(dayWorkId);
  if (!dayWork) throw new AppError(400, "Invalid day-work id!");
  if (taskIndex < 0 || taskIndex >= dayWork.tasks.length) throw new AppError(400, "Invalid task index!");

  const session = await startSession();
  try {
    session.startTransaction();

    const task = dayWork.tasks[taskIndex];
    for (const workforce of task.workforces) {
      const existingWorkforce = await Workforce.findById(workforce.workforce).session(session);
      if (existingWorkforce) {
        existingWorkforce.quantity += workforce.quantity;
        await existingWorkforce.save({ session });
      }
    }
    for (const equipment of task.equipments) {
      const existingEquipment = await Equipment.findById(equipment.equipment).session(session);
      if (existingEquipment) {
        existingEquipment.quantity += equipment.quantity;
        await existingEquipment.save({ session });
      }
    }

    dayWork.tasks.splice(taskIndex, 1);
    await dayWork.save({ session });
    await session.commitTransaction();
    return dayWork;
  } catch (error: any) {
    await session.abortTransaction();
    throw new AppError(500, error.message || "Error removing task!");
  } finally {
    session.endSession();
  }
};

const removeDayWorkWorkforce = async (dayWorkId: string, workforceId: string, taskIndex: number) => {
  const dayWork = await DayWork.findById(dayWorkId);
  if (!dayWork) throw new AppError(400, "Invalid day-work id!");
  if (taskIndex < 0 || taskIndex >= dayWork.tasks.length) throw new AppError(400, "Invalid task index!");

  const session = await startSession();
  try {
    session.startTransaction();

    const task = dayWork.tasks[taskIndex];
    const workforceToRemove = task.workforces.find(wf => wf.workforce.toString() === workforceId);
    if (!workforceToRemove) throw new AppError(400, `Workforce ID ${workforceId} not found in task`);

    const existingWorkforce = await Workforce.findById(workforceId).session(session);
    if (existingWorkforce) {
      existingWorkforce.quantity += workforceToRemove.quantity;
      await existingWorkforce.save({ session });
    }

    task.workforces = task.workforces.filter(wf => wf.workforce.toString() !== workforceId);
    await dayWork.save({ session });
    await session.commitTransaction();
    return dayWork;
  } catch (error: any) {
    await session.abortTransaction();
    throw new AppError(500, error.message || "Error removing workforce!");
  } finally {
    session.endSession();
  }
};

const removeDayWorkEquipment = async (dayWorkId: string, equipmentId: string, taskIndex: number) => {
  const dayWork = await DayWork.findById(dayWorkId);
  if (!dayWork) throw new AppError(400, "Invalid day-work id!");
  if (taskIndex < 0 || taskIndex >= dayWork.tasks.length) throw new AppError(400, "Invalid task index!");

  const session = await startSession();
  try {
    session.startTransaction();

    const task = dayWork.tasks[taskIndex];
    const equipmentToRemove = task.equipments.find(eq => eq.equipment.toString() === equipmentId);
    if (!equipmentToRemove) throw new AppError(400, `Equipment ID ${equipmentId} not found in task`);

    const existingEquipment = await Equipment.findById(equipmentId).session(session);
    if (existingEquipment) {
      existingEquipment.quantity += equipmentToRemove.quantity;
      await existingEquipment.save({ session });
    }

    task.equipments = task.equipments.filter(eq => eq.equipment.toString() !== equipmentId);
    await dayWork.save({ session });
    await session.commitTransaction();
    return dayWork;
  } catch (error: any) {
    await session.abortTransaction();
    throw new AppError(500, error.message || "Error removing equipment!");
  } finally {
    session.endSession();
  }
};

const deleteDayWork = async (id: string) => {
  const existing = await DayWork.findById(id);
  if (!existing) throw new AppError(400, "Invalid day-work id!");

  const session = await startSession();
  try {
    session.startTransaction();

    for (const task of existing.tasks) {
      for (const workforce of task.workforces) {
        const existingWorkforce = await Workforce.findById(workforce.workforce).session(session);
        if (existingWorkforce) {
          existingWorkforce.quantity += workforce.quantity;
          await existingWorkforce.save({ session });
        }
      }
      for (const equipment of task.equipments) {
        const existingEquipment = await Equipment.findById(equipment.equipment).session(session);
        if (existingEquipment) {
          existingEquipment.quantity += equipment.quantity;
          await existingEquipment.save({ session });
        }
      }
    }

    const deleted = await DayWork.findByIdAndDelete(id);
    if (deleted && existing.image) await deleteSingleFileFromS3(existing.image!.split(".com/")[1]);
    await session.commitTransaction();
    return deleted;
  } catch (error: any) {
    await session.abortTransaction();
    throw new AppError(500, error.message || "Error deleting DayWork!");
  } finally {
    session.endSession();
  }
};

export default {
  createDayWork,
  getDayWorkById,
  getProjectDayWorks,
  updateDayWork,
  addDelay,
  addComment,
  addTask,
  removeTask,
  removeDayWorkWorkforce,
  removeDayWorkEquipment,
  deleteDayWork,
};
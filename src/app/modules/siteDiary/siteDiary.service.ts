import SiteDiary from "./siteDiary.model";
import { AppError } from "../../classes/appError";
import { TSiteDiary, TTaskPayload } from "./siteDiary.interface";
import Project from "../project/project.model";
import Workforce from "../workforce/workforce.model";
import Equipment from "../equipment/equipment.model";
import mongoose, { ObjectId, startSession } from "mongoose";
import { deleteSingleFileFromS3 } from "../../utils/deleteSingleFileFromS3";
import checkProjectAuthorization from "../../utils/checkProjectAuthorization";
import { userRoles } from "../../constants/global.constant";
import AggregationBuilder from "../../classes/AggregationBuilder";

const createSiteDiary = async (userId: string, payload: TSiteDiary, file?: any) => {
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

    const siteDiary = await SiteDiary.create([payload], { session });
    await session.commitTransaction();
    return siteDiary;
  } catch (error: any) {
    await session.abortTransaction();
    await deleteSingleFileFromS3(file?.key);
    throw new AppError(500, error.message || "Error creating SiteDiary!");
  } finally {
    session.endSession();
  }
};

const getSiteDiaryById = async (id: string) => {
  const siteDiary = await SiteDiary.findById(id).populate([
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
  return siteDiary;
};

const getProjectSiteDiaries = async (query: Record<string, any>, projectId: string, userId: string) => {
  const project = await Project.findById(projectId);
  if (!project) throw new AppError(400, "Invalid project id!");

  checkProjectAuthorization(project, userId, [userRoles.companyAdmin, userRoles.employee]);

  const searchableFields = ["name", "description", "location", "comment", "delay"];
  const dayWorkQuery = new AggregationBuilder(SiteDiary, [
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
        totalEquipments: 1,
        location: 1,
        createdAt: 1
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

const updateSiteDiary = async (id: string, userId: string, payload: Partial<TSiteDiary>, file?: any) => {
  const existing = await SiteDiary.findById(id).populate("project", "company_admin supervisor manager");
  if (!existing) {
    throw new AppError(400, "Invalid site-diary id!");
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

    const updatedSiteDiary = await SiteDiary.findByIdAndUpdate(id, payload, { new: true });
    if (updatedSiteDiary && existing.image) await deleteSingleFileFromS3(existing.image!.split(".com/")[1]);
    await session.commitTransaction();
    return updatedSiteDiary;
  } catch (error: any) {
    await session.abortTransaction();
    await deleteSingleFileFromS3(file?.key);
    throw new AppError(500, error.message || "Error updating SiteDiary!");
  } finally {
    session.endSession();
  }
};

const addDelay = async (siteDiaryId: string, userId: string, delay: string) => {
  const siteDiary = await SiteDiary.findById(siteDiaryId).populate("project", "company_admin supervisor manager");
  if (!siteDiary) throw new AppError(400, "Invalid site-diary id!");

  const project = siteDiary.project as any;
  checkProjectAuthorization(project, userId, [userRoles.employee]);

  siteDiary.delay = delay;
  await siteDiary.save();
  return siteDiary;
};

const addComment = async (siteDiaryId: string, userId: string, comment: string) => {
  const siteDiary = await SiteDiary.findById(siteDiaryId).populate("project", "company_admin supervisor manager");
  if (!siteDiary) throw new AppError(400, "Invalid site-diary id!");

  const project = siteDiary.project as any;
  checkProjectAuthorization(project, userId, [userRoles.companyAdmin]);

  siteDiary.comment = comment;
  await siteDiary.save();
  return siteDiary;
};

const addTask = async (siteDiaryId: string, task: TTaskPayload) => {
  const siteDiary = await SiteDiary.findById(siteDiaryId);
  if (!siteDiary) throw new AppError(400, "Invalid site-diary id!");

  const session = await startSession();
  try {
    session.startTransaction();

    const normalizedWorkforces = task.workforces || [];
    if (normalizedWorkforces.length > 0) {
      for (const workforceData of normalizedWorkforces) {
        const existingWorkforce = await Workforce.findById(workforceData.workforce).session(session);
        if (!existingWorkforce) throw new AppError(400, `Invalid workforce ID: ${workforceData.workforce}`);
        if (existingWorkforce.project.toString() !== siteDiary.project.toString()) {
          throw new AppError(400, `Workforce ${workforceData.workforce} is not associated with project ${siteDiary.project}`);
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
        if (existingEquipment.project.toString() !== siteDiary.project.toString()) {
          throw new AppError(400, `Equipment ${equipmentData.equipment} is not associated with project ${siteDiary.project}`);
        }
        if (equipmentData.quantity > existingEquipment.quantity) throw new AppError(400, `Insufficient equipment quantity: ${equipmentData.equipment}`);
        existingEquipment.quantity -= equipmentData.quantity;
        await existingEquipment.save({ session });
      }
    }

    siteDiary.tasks.push({
      name: task.name,
      workforces: normalizedWorkforces,
      equipments: normalizedEquipments,
    });
    await siteDiary.save({ session });
    await session.commitTransaction();
    return siteDiary;
  } catch (error: any) {
    await session.abortTransaction();
    throw new AppError(500, error.message || "Error adding task!");
  } finally {
    session.endSession();
  }
};

const removeTask = async (siteDiaryId: string, taskIndex: number) => {
  const siteDiary = await SiteDiary.findById(siteDiaryId);
  if (!siteDiary) throw new AppError(400, "Invalid site-diary id!");
  if (taskIndex < 0 || taskIndex >= siteDiary.tasks.length) throw new AppError(400, "Invalid task index!");

  const session = await startSession();
  try {
    session.startTransaction();

    const task = siteDiary.tasks[taskIndex];
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

    siteDiary.tasks.splice(taskIndex, 1);
    await siteDiary.save({ session });
    await session.commitTransaction();
    return siteDiary;
  } catch (error: any) {
    await session.abortTransaction();
    throw new AppError(500, error.message || "Error removing task!");
  } finally {
    session.endSession();
  }
};

const removeSiteDiaryWorkforce = async (siteDiaryId: string, workforceId: string, taskIndex: number) => {
  const siteDiary = await SiteDiary.findById(siteDiaryId);
  if (!siteDiary) throw new AppError(400, "Invalid site-diary id!");
  if (taskIndex < 0 || taskIndex >= siteDiary.tasks.length) throw new AppError(400, "Invalid task index!");

  const session = await startSession();
  try {
    session.startTransaction();

    const task = siteDiary.tasks[taskIndex];
    const workforceToRemove = task.workforces.find(wf => wf.workforce.toString() === workforceId);
    if (!workforceToRemove) throw new AppError(400, `Workforce ID ${workforceId} not found in task`);

    const existingWorkforce = await Workforce.findById(workforceId).session(session);
    if (existingWorkforce) {
      existingWorkforce.quantity += workforceToRemove.quantity;
      await existingWorkforce.save({ session });
    }

    task.workforces = task.workforces.filter(wf => wf.workforce.toString() !== workforceId);
    await siteDiary.save({ session });
    await session.commitTransaction();
    return siteDiary;
  } catch (error: any) {
    await session.abortTransaction();
    throw new AppError(500, error.message || "Error removing workforce!");
  } finally {
    session.endSession();
  }
};

const removeSiteDiaryEquipment = async (siteDiaryId: string, equipmentId: string, taskIndex: number) => {
  const siteDiary = await SiteDiary.findById(siteDiaryId);
  if (!siteDiary) throw new AppError(400, "Invalid site-diary id!");
  if (taskIndex < 0 || taskIndex >= siteDiary.tasks.length) throw new AppError(400, "Invalid task index!");

  const session = await startSession();
  try {
    session.startTransaction();

    const task = siteDiary.tasks[taskIndex];
    const equipmentToRemove = task.equipments.find(eq => eq.equipment.toString() === equipmentId);
    if (!equipmentToRemove) throw new AppError(400, `Equipment ID ${equipmentId} not found in task`);

    const existingEquipment = await Equipment.findById(equipmentId).session(session);
    if (existingEquipment) {
      existingEquipment.quantity += equipmentToRemove.quantity;
      await existingEquipment.save({ session });
    }

    task.equipments = task.equipments.filter(eq => eq.equipment.toString() !== equipmentId);
    await siteDiary.save({ session });
    await session.commitTransaction();
    return siteDiary;
  } catch (error: any) {
    await session.abortTransaction();
    throw new AppError(500, error.message || "Error removing equipment!");
  } finally {
    session.endSession();
  }
};

const deleteSiteDiary = async (id: string) => {
  const existing = await SiteDiary.findById(id);
  if (!existing) throw new AppError(400, "Invalid site-diary id!");

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

    const deleted = await SiteDiary.findByIdAndDelete(id);
    if (deleted && existing.image) await deleteSingleFileFromS3(existing.image!.split(".com/")[1]);
    await session.commitTransaction();
    return deleted;
  } catch (error: any) {
    await session.abortTransaction();
    throw new AppError(500, error.message || "Error deleting SiteDiary!");
  } finally {
    session.endSession();
  }
};

export default {
  createSiteDiary,
  getSiteDiaryById,
  getProjectSiteDiaries,
  updateSiteDiary,
  addDelay,
  addComment,
  addTask,
  removeTask,
  removeSiteDiaryWorkforce,
  removeSiteDiaryEquipment,
  deleteSiteDiary,
};
import DayWork from "./dayWork.model";
import { AppError } from "../../classes/appError";
import { TDayWork } from "./dayWork.interface";
import Project from "../project/project.model";
import Workforce from "../workforce/workforce.model";
import Equipment from "../equipment/equipment.model";
import QueryBuilder from "../../classes/queryBuilder";
import { startSession } from "mongoose";
import { deleteSingleFileFromS3 } from "../../utils/deletes3Image";

const createDayWork = async (userId: string, payload: TDayWork, file?: any) => {
  if (file) payload.image = file.location;
  // Start a session for transaction
  const session = await startSession();
  session.startTransaction();

  try {
    // Check if project exists
    const project = await Project.findById(payload.project).session(session);
    if (!project) {
      await deleteSingleFileFromS3(file?.key);
      throw new AppError(400, "Invalid project ID!");
    }

    // Allow only if user is involved in this project
    if (
      userId !== project.supervisor.toString() &&
      userId !== project.manager.toString()
    ) {
      await deleteSingleFileFromS3(file?.key);
      throw new AppError(401, "Unauthorized!");
    }

    // Validate and deduct workforces
    for (const workforceData of payload.workforces) {
      const existingWorkforce = await Workforce.findById(workforceData.workforce).session(session);
      if (!existingWorkforce) {
        await deleteSingleFileFromS3(file?.key);
        throw new AppError(400, `Invalid workforce ID: ${workforceData.workforce}`);
      }

      if (workforceData.quantity > existingWorkforce.quantity) {
        await deleteSingleFileFromS3(file?.key);
        throw new AppError(400, `Insufficient workforce quantity: ${workforceData.workforce}`);
      }

      // Deduct the workforce quantity
      existingWorkforce.quantity -= workforceData.quantity;
      await existingWorkforce.save({ session });
    }

    // Validate and deduct equipments
    for (const equipmentData of payload.equipments) {
      const existingEquipment = await Equipment.findById(equipmentData.equipment).session(session);
      if (!existingEquipment) {
        await deleteSingleFileFromS3(file?.key);
        throw new AppError(400, `Invalid equipment ID: ${equipmentData.equipment}`);
      }

      if (equipmentData.quantity > existingEquipment.quantity) {
        await deleteSingleFileFromS3(file?.key);
        throw new AppError(400, `Insufficient equipment quantity: ${equipmentData.equipment}`);
      }

      // Deduct the equipment quantity
      existingEquipment.quantity -= equipmentData.quantity;
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
  const dayWork = await DayWork.findById(id).populate("project").populate("workforces.workforce", "name").populate("equipments.equipment", "name");
  return dayWork;
};

const getProjectDayWorks = async (query: Record<string, any>, projectId: string, userId: string) => {
  const project = await Project.findById(projectId);
  if (!project) throw new AppError(400, "Invalid project id!");

  // Allow only if user is involved in this project
  if (
    userId !== project.company_admin.toString() &&
    userId !== project.supervisor.toString() &&
    userId !== project.manager.toString()
  ) {
    throw new AppError(401, "Unauthorized!");
  }
  const searchableFields = ["name", "description", "materials", "location", "comment", "delay"];

  const dayWorkQuery = new QueryBuilder(DayWork.find({ project: projectId }), query)
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .selectFields();

  const meta = await dayWorkQuery.countTotal();
  const result = await dayWorkQuery.queryModel;
  return { data: result, meta };
};

const updateDayWork = async (id: string, userId: string, payload: Partial<TDayWork>, file?: any) => {
  const existing = await DayWork.findById(id).populate("project", "company_admin supervisor manager");
  if (!existing) {
    throw new AppError(400, "Invalid day-work id!");
  }

  const project = existing.project as any;
  // Allow only if userId matches any of the roles, else throw Unauthorized
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

    // Validate and deduct workforces
    if (payload.workforces && payload.workforces?.length > 0) {
      for (const workforceData of payload.workforces) {
        const existingWorkforce = await Workforce.findById(workforceData.workforce).session(session);
        if (!existingWorkforce) {
          await deleteSingleFileFromS3(file?.key);
          throw new AppError(400, `Invalid workforce ID: ${workforceData.workforce}`);
        }

        const previousWorkForceData = existing.workforces.find((wf) => wf.workforce.toString() === workforceData.workforce.toString());

        if (previousWorkForceData) {
          if (previousWorkForceData && previousWorkForceData.quantity < workforceData.quantity) {
            if (workforceData.quantity - previousWorkForceData.quantity > existingWorkforce.quantity) {
              await deleteSingleFileFromS3(file?.key);
              throw new AppError(400, `Insufficient workforce quantity: ${workforceData.workforce}`);
            } else {
              // Deduct the workforce quantity
              existingWorkforce.quantity -= workforceData.quantity - previousWorkForceData.quantity;
              await existingWorkforce.save({ session });
            }
          } else if (previousWorkForceData.quantity > workforceData.quantity) {
            // Increase the workforce quantity
            existingWorkforce.quantity += previousWorkForceData.quantity - workforceData.quantity;
            await existingWorkforce.save({ session });
          }
        }
      }

      // Validate and deduct equipments
      if (payload.equipments && payload.equipments?.length > 0) {
        for (const equipmentData of payload.equipments) {
          const existingEquipment = await Equipment.findById(equipmentData.equipment).session(session);
          if (!existingEquipment) {
            await deleteSingleFileFromS3(file?.key);
            throw new AppError(400, `Invalid equipment ID: ${equipmentData.equipment}`);
          }

          const previousEquipmentData = existing.equipments.find((eq) => eq.equipment.toString() === equipmentData.equipment.toString());

          if (previousEquipmentData) {
            if (previousEquipmentData && previousEquipmentData.quantity < equipmentData.quantity) {
              if (equipmentData.quantity - previousEquipmentData.quantity > existingEquipment.quantity) {
                await deleteSingleFileFromS3(file?.key);
                throw new AppError(400, `Insufficient equipment quantity: ${equipmentData.equipment}`);
              } else {
                // Deduct the equipment quantity
                existingEquipment.quantity -= equipmentData.quantity - previousEquipmentData.quantity;
                await existingEquipment.save({ session });
              }
            } else if (previousEquipmentData.quantity > equipmentData.quantity) {
              // Increase the equipment quantity
              existingEquipment.quantity += previousEquipmentData.quantity - equipmentData.quantity;
              await existingEquipment.save({ session });
            }
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

const removeDayWorkWorkforce = async (dayWorkId: string, workforceId: string) => {
  const dayWork = await DayWork.findById(dayWorkId);
  if (!dayWork) throw new AppError(400, "Invalid day-work id!");
  dayWork.workforces = dayWork.workforces.filter((wf) => wf.workforce.toString() !== workforceId);

  const session = await startSession();

  const workforce = dayWork.workforces.find((wf) => wf.workforce.toString() === workforceId);
  try {
    session.startTransaction();
    await dayWork.save({ session });
    await Workforce.findByIdAndUpdate(workforceId, { $inc: { quantity: workforce?.quantity } }, { session });
    await session.commitTransaction();
  } catch (error: any) {
    await session.abortTransaction();
    throw new AppError(500, error.message || "Error updating DayWork!");
  } finally {
    session.endSession();
  }
}

const removeDayWorkEquipment = async (dayWorkId: string, equipmentId: string) => {
  const dayWork = await DayWork.findById(dayWorkId);
  if (!dayWork) throw new AppError(400, "Invalid day-work id!");
  dayWork.equipments = dayWork.equipments.filter((eq) => eq.equipment.toString() !== equipmentId);

  const session = await startSession();

  const equipment = dayWork.equipments.find((eq) => eq.equipment.toString() === equipmentId);
  try {
    session.startTransaction();
    await dayWork.save({ session });
    await Equipment.findByIdAndUpdate(equipmentId, { $inc: { quantity: equipment?.quantity } }, { session });
    await session.commitTransaction();
  } catch (error: any) {
    await session.abortTransaction();
    throw new AppError(500, error.message || "Error updating DayWork!");
  } finally {
    session.endSession();
  }
}

const deleteDayWork = async (id: string) => {
  const existing = await DayWork.findById(id);
  if (!existing) throw new AppError(400, "Invalid day-work id!");

  const deleted = await DayWork.findByIdAndDelete(id);
  if (deleted && existing.image) await deleteSingleFileFromS3(existing.image!.split(".com/")[1]);
  return deleted;
};

export default {
  createDayWork,
  getDayWorkById,
  getProjectDayWorks,
  updateDayWork,
  removeDayWorkWorkforce,
  removeDayWorkEquipment,
  deleteDayWork,
};

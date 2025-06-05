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
  console.log('image', file?.location);
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

    // Allow only if userId matches any of the roles, else throw Unauthorized
    if (
      userId !== project.supervisor.toString() &&
      userId !== project.manager.toString()
    ) {
      await deleteSingleFileFromS3(file?.key);
      throw new AppError(401, "Unauthorized!");
    }

    // Validate and deduct workforces
    for (const workforce of payload.workforces) {
      const existingWorkforce = await Workforce.findById(workforce.workforce).session(session);
      if (!existingWorkforce) {
        await deleteSingleFileFromS3(file?.key);
        throw new AppError(400, `Invalid workforce ID: ${workforce.workforce}`);
      }

      if (workforce.quantity > existingWorkforce.quantity) {
        await deleteSingleFileFromS3(file?.key);
        throw new AppError(400, `Insufficient workforce quantity: ${workforce.workforce}`);
      }

      // Deduct the workforce quantity
      existingWorkforce.quantity -= workforce.quantity;
      await existingWorkforce.save({ session });
    }

    // Validate and deduct equipments
    for (const equipment of payload.equipments) {
      const existingEquipment = await Equipment.findById(equipment.equipment).session(session);
      if (!existingEquipment) {
        await deleteSingleFileFromS3(file?.key);
        throw new AppError(400, `Invalid equipment ID: ${equipment.equipment}`);
      }

      // Deduct the equipment quantity
      existingEquipment.quantity -= equipment.quantity;
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

const getProjectDayWorks = async (query: Record<string, any>, projectId: string) => {
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

  const updated = await DayWork.findByIdAndUpdate(id, payload, { new: true });
  return updated;
};

const deleteDayWork = async (id: string) => {
  const existing = await DayWork.findById(id);
  if (!existing) throw new AppError(400, "Invalid day-work id!");

  const deleted = await DayWork.findByIdAndDelete(id);
  return deleted;
};

export default {
  createDayWork,
  getDayWorkById,
  getProjectDayWorks,
  updateDayWork,
  deleteDayWork,
};

import { Equipment } from './equipment.model';
import { AppError } from '../../classes/appError';
import Project from '../project/project.model';
import { TEquipment } from './equipment.interface';

const createEquipment = async (payload: TEquipment[]) => {
  payload.forEach(async (equipment: TEquipment) => {
    const project = await Project.findById(equipment.project);
    if (!project) throw new AppError(400, 'Invalid project id!');
    equipment.initial_quantity = equipment.quantity;
    const result = await Equipment.create(equipment);
    return result;
  })
};

const getEquipmentById = async (id: string) => {
  const equipment = await Equipment.findById(id)
  return equipment;
};

const getProjectEquipments = async (projectId: string) => {
  const equipment = await Equipment.find({ project: projectId });
  return equipment;
};

const updateEquipment = async (id: string, payload: Partial<TEquipment>, userId: string) => {
  const existing = await Equipment.findById(id).populate('project', "company_admin supervisor manager");
  if (!existing) throw new AppError(404, 'Equipment not found');

  const project = existing.project as any;
  // Allow only if userId matches any of the roles, else throw Unauthorized
  if (
    userId !== project.company_admin.toString() &&
    userId !== project.supervisor.toString() &&
    userId !== project.manager.toString()
  ) {
    throw new AppError(401, 'Unauthorized');
  }

  if (payload.quantity) payload.initial_quantity = payload.quantity

  const updated = await Equipment.findByIdAndUpdate(id, payload, { new: true });
  return updated;
};

const deleteEquipment = async (id: string, userId: string) => {
  const existing = await Equipment.findById(id).populate('project', "company_admin supervisor manager");
  if (!existing) throw new AppError(404, 'Equipment not found');

  const project = existing.project as any;
  // Allow only if userId matches any of the roles, else throw Unauthorized
  if (
    userId !== project.company_admin.toString() &&
    userId !== project.supervisor.toString() &&
    userId !== project.manager.toString()
  ) {
    throw new AppError(401, 'Unauthorized');
  }

  const deleted = await Equipment.findByIdAndUpdate(id, { is_deleted: true }, { new: true });
  return deleted;
};

export default {
  createEquipment,
  getEquipmentById,
  getProjectEquipments,
  updateEquipment,
  deleteEquipment,
};

import Workforce from './workforce.model';
import { AppError } from '../../classes/appError';
import { TWorkforce } from './workforce.interface';
import Project from '../project/project.model';

const createWorkforce = async (payload: TWorkforce[]) => {
  payload.forEach(async (workforce: TWorkforce) => {
    const project = await Project.findById(workforce.project);
    if (!project) throw new AppError(400, 'Invalid project id!');
    const result = await Workforce.create(workforce);
    return result;
  })
};

const getWorkforceById = async (id: string) => {
  const workforce = await Workforce.findById(id)
  return workforce;
};

const getProjectWorkforces = async (projectId: string) => {
  const workforces = await Workforce.find({ project: projectId, is_deleted: false });
  return workforces;
};

const updateWorkforce = async (id: string, payload: Partial<TWorkforce>, userId: string) => {
  const existing = await Workforce.findById(id).populate('project', "company_admin supervisor manager");
  if (!existing) throw new AppError(404, 'Workforce not found');

  const project = existing.project as any;
  // Allow only if userId matches any of the roles, else throw Unauthorized
  if (
    userId !== project.company_admin.toString() &&
    userId !== project.supervisor.toString() &&
    userId !== project.manager.toString()
  ) {
    throw new AppError(401, 'Unauthorized');
  }

  const updated = await Workforce.findByIdAndUpdate(id, payload, { new: true });
  return updated;
};

const deleteWorkforce = async (id: string, userId: string) => {
  const existing = await Workforce.findById(id).populate('project', "company_admin supervisor manager");
  if (!existing) throw new AppError(404, 'Workforce not found');

  const project = existing.project as any;
  // Allow only if userId matches any of the roles, else throw Unauthorized
  if (
    userId !== project.company_admin.toString() &&
    userId !== project.supervisor.toString() &&
    userId !== project.manager.toString()
  ) {
    throw new AppError(401, 'Unauthorized');
  }

  const deleted = await Workforce.findByIdAndUpdate(id, { is_deleted: true }, { new: true });
  return deleted;
};

export default {
  createWorkforce,
  getWorkforceById,
  getProjectWorkforces,
  updateWorkforce,
  deleteWorkforce,
};

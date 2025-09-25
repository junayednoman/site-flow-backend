import Folder from './folder.model';
import { AppError } from '../../classes/appError';
import { TFile } from './folder.interface';
import { Types } from 'mongoose';
import Project from '../project/project.model';
import checkProjectAuthorization from '../../utils/checkProjectAuthorization';
import { userRoles } from '../../constants/global.constant';
import { deleteFromS3, uploadToS3 } from '../../utils/awss3';

const createFolder = async (userId: string, payload: { name: string; project: string, added_by: string }) => {
  const project = await Project.findById(payload.project);
  if (!project) throw new AppError(400, "Invalid project id!");

  checkProjectAuthorization(project, userId, [userRoles.companyAdmin, userRoles.employee]);
  payload.added_by = userId;
  const existing = await Folder.findOne({ name: payload.name, project: payload.project });
  if (existing) throw new AppError(400, "Folder already exists with the name!");
  const folder = await Folder.create(payload);
  return folder;
}

const getFoldersByProjectId = async (userId: string, projectId: string) => {
  const project = await Project.findById(projectId);
  if (!project) throw new AppError(400, "Invalid project id!");
  checkProjectAuthorization(project, userId, [userRoles.companyAdmin, userRoles.employee]);
  const folders = await Folder.aggregate([
    { $match: { project: new Types.ObjectId(projectId) } },
    {
      $project: {
        name: 1,
        files: {
          $size: "$files"
        }
      }
    }
  ])
  return folders;
};

const getSingleFolder = async (folderId: string) => {
  const folder = await Folder.findById(folderId);
  return folder;
}

const updateFolderName = async (folderId: string, payload: { name: string }) => {
  const folder = await Folder.findById(folderId);
  if (!folder) throw new AppError(404, "Folder not found!");

  folder.name = payload.name;
  await folder.save();
  return folder;
};

const addFile = async (folderId: string, payload: TFile, file: any) => {
  if (!file) throw new AppError(400, "File is required!");

  const folder = await Folder.findById(folderId);
  if (!folder) throw new AppError(404, "Folder not found!");

  if (folder.files.some(file => file.name === payload.name)) {
    throw new AppError(400, "File already exists with the name!");
  }

  payload.url = await uploadToS3(file);
  folder.files.push(payload as TFile);
  await folder.save();
  return folder;
};

const removeFile = async (folderId: string, payload: { url: string }) => {
  const folder = await Folder.findById(folderId);
  if (!folder) throw new AppError(404, "Folder not found!");

  folder.files = folder.files.filter(file => file.url !== payload.url);
  await folder.save();
  // delete file from aws
  await deleteFromS3(payload.url);
  return folder;
};

const deleteFolder = async (folderId: string) => {
  const folder = await Folder.findById(folderId);
  if (!folder) throw new AppError(404, "Folder not found!");

  await folder.deleteOne();
  folder.files.forEach(async (file) => {
    await deleteFromS3(file.url);
  })
  return { message: "Folder deleted successfully!" };
};

export default { createFolder, getFoldersByProjectId, updateFolderName, addFile, removeFile, deleteFolder, getSingleFolder };
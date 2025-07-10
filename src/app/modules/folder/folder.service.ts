import Folder from './folder.model';
import { AppError } from '../../classes/appError';
import { TFile } from './folder.interface';
import { Types } from 'mongoose';
import Project from '../project/project.model';
import checkProjectAuthorization from '../../utils/checkProjectAuthorization';
import { userRoles } from '../../constants/global.constant';
import { deleteSingleFileFromS3 } from '../../utils/deletes3Image';

const createFolder = async (userId: string, payload: { name: string; project: string, added_by: string }) => {
  const project = await Project.findById(payload.project);
  if (!project) throw new AppError(400, "Invalid project id!");

  checkProjectAuthorization(project, userId, [userRoles.companyAdmin, userRoles.employee]);
  payload.added_by = userId;
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
  if (!folders.length) throw new AppError(404, "No folders found for this project!");
  return folders;
};

const getSingleFolder = async (userId: string, folderId: string) => {
  const folder = await Folder.findById(folderId);
  const project = await Project.findById(folder?.project);
  checkProjectAuthorization(project!, userId, [userRoles.companyAdmin, userRoles.employee]);
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
  payload.url = file.location
  const folder = await Folder.findById(folderId);
  if (!folder) throw new AppError(404, "Folder not found!");

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
  await deleteSingleFileFromS3(payload.url.split(".amazonaws.com/")[1]);
  return folder;
};

const deleteFolder = async (folderId: string) => {
  const folder = await Folder.findById(folderId);
  if (!folder) throw new AppError(404, "Folder not found!");

  await folder.deleteOne();
  folder.files.forEach(async (file) => {
    await deleteSingleFileFromS3(file.url.split(".amazonaws.com/")[1]);
  })
  return { message: "Folder deleted successfully!" };
};

export default { createFolder, getFoldersByProjectId, updateFolderName, addFile, removeFile, deleteFolder, getSingleFolder };
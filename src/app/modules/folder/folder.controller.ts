import handleAsyncRequest from "../../utils/handleAsyncRequest";
import { successResponse } from "../../utils/successResponse";
import folderService from "./folder.service";

const createFolder = handleAsyncRequest(async (req: any, res) => {
  const id = req.user.id;
  const payload = req.body;
  const result = await folderService.createFolder(id, payload);
  successResponse(res, {
    message: "Folder created successfully!",
    data: result,
    status: 201,
  });
});

const getFoldersByProjectId = handleAsyncRequest(async (req: any, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;
  const result = await folderService.getFoldersByProjectId(userId, projectId);
  successResponse(res, {
    message: "Folders retrieved successfully!",
    data: result,
  });
});

const getSingleFolder = handleAsyncRequest(async (req: any, res) => {
  const { folderId } = req.params;
  const userId = req.user.id;
  const result = await folderService.getSingleFolder(userId, folderId);
  successResponse(res, {
    message: "Folder retrieved successfully!",
    data: result,
  });
});

const updateFolderName = handleAsyncRequest(async (req: any, res) => {
  const { folderId } = req.params;
  const { name } = req.body;
  const result = await folderService.updateFolderName(folderId, { name });
  successResponse(res, {
    message: "Folder name updated successfully!",
    data: result,
  });
});

const addFile = handleAsyncRequest(async (req: any, res) => {
  const { folderId } = req.params;
  const { file } = req;
  const payload = JSON.parse(req.body.payload || "{}");
  const result = await folderService.addFile(folderId, payload, file);
  successResponse(res, {
    message: "File added to folder successfully!",
    data: result,
  });
});

const removeFile = handleAsyncRequest(async (req: any, res) => {
  const { folderId } = req.params;
  const payload = req.body;
  const result = await folderService.removeFile(folderId, payload);
  successResponse(res, {
    message: "File removed from folder successfully!",
    data: result,
  });
});

const deleteFolder = handleAsyncRequest(async (req: any, res) => {
  const { folderId } = req.params;
  const result = await folderService.deleteFolder(folderId);
  successResponse(res, {
    message: "Folder deleted successfully!",
    data: result,
  });
});

const folderController = {
  createFolder,
  getFoldersByProjectId,
  getSingleFolder,
  updateFolderName,
  addFile,
  removeFile,
  deleteFolder,
};
export default folderController;
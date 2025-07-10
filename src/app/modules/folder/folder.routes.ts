import { Router } from "express";
import { userRoles } from "../../constants/global.constant";
import authVerify from "../../middlewares/authVerify";
import { handleZodValidation } from "../../middlewares/handleZodValidation";
import {
  createFolderValidationSchema,
  updateFolderNameValidationSchema,
  addFileValidationSchema,
  removeFileValidationSchema,
} from "./folder.validation";
import folderController from "./folder.controller";
import { upload } from "../../utils/multerS3Uploader";

const folderRoutes = Router();

folderRoutes.post(
  "/",
  authVerify([userRoles.companyAdmin, userRoles.employee]),
  handleZodValidation(createFolderValidationSchema),
  folderController.createFolder
);

folderRoutes.get(
  "/project/:projectId",
  authVerify([userRoles.companyAdmin, userRoles.employee]),
  folderController.getFoldersByProjectId
);

folderRoutes.get(
  "/:folderId",
  authVerify([userRoles.companyAdmin, userRoles.employee]),
  folderController.getSingleFolder
);

folderRoutes.patch(
  "/:folderId/name",
  authVerify([userRoles.companyAdmin, userRoles.employee]),
  handleZodValidation(updateFolderNameValidationSchema),
  folderController.updateFolderName
);

folderRoutes.post(
  "/:folderId/files",
  authVerify([userRoles.companyAdmin, userRoles.employee]),
  upload.single("file"),
  handleZodValidation(addFileValidationSchema, true),
  folderController.addFile
);

folderRoutes.patch(
  "/:folderId/files",
  authVerify([userRoles.companyAdmin, userRoles.employee]),
  handleZodValidation(removeFileValidationSchema),
  folderController.removeFile
);

folderRoutes.delete(
  "/:folderId",
  authVerify([userRoles.companyAdmin, userRoles.employee]),
  folderController.deleteFolder
);

export default folderRoutes;
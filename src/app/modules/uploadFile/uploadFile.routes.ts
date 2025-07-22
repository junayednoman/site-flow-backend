import { Router } from "express";
import authVerify from "../../middlewares/authVerify";
import { userRoles } from "../../constants/global.constant";
import { upload } from "../../utils/multerS3Uploader";
import { uploadFileController } from "./uploadFile.controller";
import { handleZodValidation } from "../../middlewares/handleZodValidation";
import { deleteFileValidationSchema } from "./uploadFile.validation";

const router = Router()

router.post("/", authVerify([userRoles.companyAdmin, userRoles.employee]), upload.single("file"), uploadFileController.uploadFile)
router.delete("/", authVerify([userRoles.companyAdmin, userRoles.employee]), handleZodValidation(deleteFileValidationSchema), uploadFileController.deleteFile)

export const uploadFileRoutes = router
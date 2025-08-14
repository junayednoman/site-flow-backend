import { Router } from "express";
import { upload } from "../../utils/multerS3Uploader";
import { uploadFileController } from "./uploadFile.controller";
import { handleZodValidation } from "../../middlewares/handleZodValidation";
import { deleteFileValidationSchema } from "./uploadFile.validation";

const router = Router()

router.post("/", upload.single("file"), uploadFileController.uploadFile)
router.delete("/", handleZodValidation(deleteFileValidationSchema), uploadFileController.deleteFile)

export const uploadFileRoutes = router
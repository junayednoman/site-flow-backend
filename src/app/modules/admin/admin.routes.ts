import { Router } from "express";
import adminControllers from "./admin.controller";
import authVerify from "../../middlewares/authVerify";
import { handleZodValidation } from "../../middlewares/handleZodValidation";
import updateAdminValidationSchema from "./admin.validation";
import { upload } from "../../utils/multerS3Uploader";
import { userRoles } from "../../constants/global.constant";
const adminRouters = Router();

adminRouters.get("/", authVerify([userRoles.admin]), adminControllers.getAdminProfile);
adminRouters.put(
  "/",
  authVerify([userRoles.admin]),
  handleZodValidation(updateAdminValidationSchema),
  adminControllers.updateAdmin
);
adminRouters.put(
  "/image",
  authVerify([userRoles.admin]),
  upload.single("image"),
  adminControllers.updateAdminImage
);
export default adminRouters;

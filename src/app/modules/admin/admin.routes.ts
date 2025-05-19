import { Router } from "express";
import adminControllers from "./admin.controller";
import authVerify from "../../middlewares/authVerify";
import { handleZodValidation } from "../../middlewares/handleZodValidation";
import updateAdminValidationSchema from "./admin.validation";
import { upload } from "../../utils/multerS3Uploader";
const adminRouters = Router();

adminRouters.get("/", authVerify(["admin"]), adminControllers.getAdminProfile);
adminRouters.put(
  "/",
  authVerify(["admin"]),
  handleZodValidation(updateAdminValidationSchema),
  adminControllers.updateAdmin
);
adminRouters.put(
  "/image",
  authVerify(["admin"]),
  upload.single("image"),
  adminControllers.updateAdminImage
);
export default adminRouters;

import { Router } from "express";
import authVerify from "../../middlewares/authVerify";
import companyAdminController from "./companyAdmin.controller";
import { userRoles } from "../../constants/global.constant";
import { handleZodValidation } from "../../middlewares/handleZodValidation";
import { companyUpdateSchema } from "./companyAdmin.validation";
import { upload } from "../../utils/awss3";

const companyAdminRouters = Router();

companyAdminRouters.get("/profile", authVerify([userRoles.companyAdmin]), companyAdminController.getCompanyAdminProfile);
companyAdminRouters.get("/", authVerify([userRoles.admin]), companyAdminController.getAllCompanyAdmins);
companyAdminRouters.get("/:id", authVerify([userRoles.admin]), companyAdminController.getSingleCompanyAdmin);
companyAdminRouters.put("/", authVerify([userRoles.companyAdmin]), upload.fields([{ name: "image", maxCount: 1 }, { name: "logo", maxCount: 1 }]), handleZodValidation(companyUpdateSchema, true), companyAdminController.updateCompanyAdminProfile);

export default companyAdminRouters;
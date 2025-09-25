import { Router } from "express";
import { userRoles } from "../../constants/global.constant";
import authVerify from "../../middlewares/authVerify";
import { handleZodValidation } from "../../middlewares/handleZodValidation";
import { addOrReplaceDuctingReportValidationSchema, removeSignatureValidationSchema } from "./ductingReport.validation";
import ductingReportController from "./ductingReport.controller";
import { upload } from "../../utils/awss3";

const ductingReportRoutes = Router();

ductingReportRoutes.post(
  "/",
  authVerify([userRoles.companyAdmin, userRoles.employee]),
  upload.fields([
    { name: 'client_approved_signature', maxCount: 1 },
    { name: 'signed_on_completion_signature', maxCount: 1 },
  ]),
  handleZodValidation(addOrReplaceDuctingReportValidationSchema, true),
  ductingReportController.addOrReplaceDuctingReport
);

ductingReportRoutes.get(
  "/:projectId",
  authVerify([userRoles.companyAdmin, userRoles.employee]),
  ductingReportController.getProjectDuctingReport
);

ductingReportRoutes.delete(
  "/:projectId/signature",
  authVerify([userRoles.companyAdmin, userRoles.employee]),
  handleZodValidation(removeSignatureValidationSchema),
  ductingReportController.removeSignature
);

export default ductingReportRoutes;
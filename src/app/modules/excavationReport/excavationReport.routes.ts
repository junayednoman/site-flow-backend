import { Router } from "express";
import { userRoles } from "../../constants/global.constant";
import authVerify from "../../middlewares/authVerify";
import { handleZodValidation } from "../../middlewares/handleZodValidation";
import { addOrReplaceExcavationReportValidationSchema, removeSignatureValidationSchema } from "./excavationReport.validation";
import excavationReportController from "./excavationReport.controller";
import { upload } from "../../utils/multerS3Uploader";

const excavationReportRoutes = Router();

excavationReportRoutes.post(
  "/",
  authVerify([userRoles.companyAdmin, userRoles.employee]),
  upload.fields([
    { name: 'client_approved_signature', maxCount: 1 },
    { name: 'signed_on_completion_signature', maxCount: 1 },
  ]),
  handleZodValidation(addOrReplaceExcavationReportValidationSchema, true),
  excavationReportController.addOrReplaceExcavationReport
);

excavationReportRoutes.get(
  "/:projectId",
  authVerify([userRoles.companyAdmin, userRoles.employee]),
  excavationReportController.getProjectExcavationReport
);

excavationReportRoutes.delete(
  "/:projectId/signature",
  authVerify([userRoles.companyAdmin, userRoles.employee]),
  handleZodValidation(removeSignatureValidationSchema),
  excavationReportController.removeSignature
);

export default excavationReportRoutes;
import { Router } from "express";
import { userRoles } from "../../constants/global.constant";
import authVerify from "../../middlewares/authVerify";
import { handleZodValidation } from "../../middlewares/handleZodValidation";
import { addOrReplacePostPourInspectionReportValidationSchema, removeSignatureValidationSchema } from "./postPourInspectionReport.validation";
import postPourInspectionReportController from "./postPourInspectionReport.controller";
import { upload } from "../../utils/multerS3Uploader";

const postPourInspectionReportRoutes = Router();

postPourInspectionReportRoutes.post(
  "/",
  authVerify([userRoles.companyAdmin, userRoles.employee]),
  upload.fields([
    { name: 'client_approved_signature', maxCount: 1 },
    { name: 'signed_on_completion_signature', maxCount: 1 },
  ]),
  handleZodValidation(addOrReplacePostPourInspectionReportValidationSchema, true),
  postPourInspectionReportController.addOrReplacePostPourInspectionReport
);

postPourInspectionReportRoutes.get(
  "/:projectId",
  authVerify([userRoles.companyAdmin, userRoles.employee]),
  postPourInspectionReportController.getProjectPostPourInspectionReport
);

postPourInspectionReportRoutes.delete(
  "/:projectId/signature",
  authVerify([userRoles.companyAdmin, userRoles.employee]),
  handleZodValidation(removeSignatureValidationSchema),
  postPourInspectionReportController.removeSignatureFromPostPourInspectionReport
);

export default postPourInspectionReportRoutes;
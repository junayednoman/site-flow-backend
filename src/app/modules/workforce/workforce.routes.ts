import { Router } from "express";
import authVerify from "../../middlewares/authVerify";
import { userRoles } from "../../constants/global.constant";
import workforceController from "./workforce.controller";
import { handleZodValidation } from "../../middlewares/handleZodValidation";
import { updateWorkforceValidationSchema, workforceValidationSchema } from "./workforce.validation";

const router = Router();

router.post(
  "/",
  authVerify([userRoles.companyAdmin, userRoles.employee]),
  handleZodValidation(workforceValidationSchema),
  workforceController.createWorkforce
);

router.get(
  "/:id",
  authVerify([userRoles.companyAdmin, userRoles.employee, userRoles.employee]),
  workforceController.getWorkforceById
);

router.get(
  "/all/:projectId",
  authVerify([userRoles.companyAdmin, userRoles.employee, userRoles.employee]),
  workforceController.getProjectWorkforces
);

router.put(
  "/:id",
  authVerify([userRoles.companyAdmin, userRoles.employee]),
  handleZodValidation(updateWorkforceValidationSchema),
  workforceController.updateWorkforce
);

router.delete(
  "/:id",
  authVerify([userRoles.companyAdmin, userRoles.employee]),
  workforceController.deleteWorkforce
);

const workforceRoutes = router;
export default workforceRoutes;

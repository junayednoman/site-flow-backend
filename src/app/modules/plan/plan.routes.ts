import { Router } from "express";
import { userRoles } from "../../constants/global.constant";
import authVerify from "../../middlewares/authVerify";
import { handleZodValidation } from "../../middlewares/handleZodValidation";
import planController from "./plan.controller";
import { planZodSchema, updatePlanZodSchema } from "./plan.validation";

const router = Router();

router.post(
  "/",
  authVerify([userRoles.employee]),
  handleZodValidation(planZodSchema),
  planController.createPlan
);

router.get(
  "/:id",
  authVerify([userRoles.employee, userRoles.companyAdmin]),
  planController.getPlanById
);

router.get(
  "/project/:projectId",
  authVerify([userRoles.employee, userRoles.companyAdmin]),
  planController.getProjectsAllPlans
);

router.put(
  "/:id",
  authVerify([userRoles.employee]),
  handleZodValidation(updatePlanZodSchema),
  planController.updatePlan
);

router.delete(
  "/:id",
  authVerify([userRoles.employee]),
  planController.deletePlan
);

const planRoutes = router;

export default planRoutes;
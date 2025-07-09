import { Router } from "express";
import { userRoles } from "../../constants/global.constant";
import authVerify from "../../middlewares/authVerify";
import planController from "./plan.controller";
import { handleZodValidation } from "../../middlewares/handleZodValidation";
import { createPlanValidation, updatePlanValidation, addTaskValidation } from "./plan.validation";

const router = Router();

router.post(
  "/",
  authVerify([userRoles.employee]),
  handleZodValidation(createPlanValidation, true),
  planController.createPlan
);

router.get(
  "/:id",
  authVerify([userRoles.companyAdmin, userRoles.employee]),
  planController.getPlanById
);

router.get(
  "/project/:projectId",
  authVerify([userRoles.companyAdmin, userRoles.employee]),
  planController.getProjectPlans
);

router.put(
  "/:id",
  authVerify([userRoles.employee]),
  handleZodValidation(updatePlanValidation, true),
  planController.updatePlan
);

router.delete(
  "/:id",
  authVerify([userRoles.employee]),
  planController.deletePlan
);

router.patch(
  "/remove-workforce/:id",
  authVerify([userRoles.employee]),
  planController.removePlanWorkforce
);

router.patch(
  "/remove-equipment/:id",
  authVerify([userRoles.employee]),
  planController.removePlanEquipment
);

router.post(
  "/:id/task",
  authVerify([userRoles.employee]),
  handleZodValidation(addTaskValidation, true),
  planController.addTask
);

router.patch("/remove-task/:id", authVerify([userRoles.employee]), planController.removeTask);

const planRouters = router;

export default planRouters;
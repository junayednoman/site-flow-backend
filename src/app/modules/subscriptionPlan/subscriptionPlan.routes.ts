import { Router } from "express";
import { userRoles } from "../../constants/global.constant";
import authVerify from "../../middlewares/authVerify";
import { handleZodValidation } from "../../middlewares/handleZodValidation";
import { createSubscriptionPlanValidationSchema, updateSubscriptionPlanValidationSchema } from "./subscriptionPlan.validation";
import subscriptionPlanController from "./subscriptionPlan.controller";

const subscriptionPlanRoutes = Router();

subscriptionPlanRoutes.post(
  "/",
  authVerify([userRoles.admin]),
  handleZodValidation(createSubscriptionPlanValidationSchema),
  subscriptionPlanController.createSubscriptionPlan
);

subscriptionPlanRoutes.put(
  "/:planId",
  authVerify([userRoles.admin]),
  handleZodValidation(updateSubscriptionPlanValidationSchema),
  subscriptionPlanController.updateSubscriptionPlan
);

subscriptionPlanRoutes.get(
  "/",
  authVerify([userRoles.companyAdmin, userRoles.employee, userRoles.admin]),
  subscriptionPlanController.getAllSubscriptionPlans
);

subscriptionPlanRoutes.get(
  "/:planId",
  authVerify([userRoles.companyAdmin, userRoles.employee, userRoles.admin]),
  subscriptionPlanController.getSingleSubscriptionPlan
);

subscriptionPlanRoutes.delete(
  "/:planId",
  authVerify([userRoles.admin]),
  subscriptionPlanController.softDeleteSubscriptionPlan
);

export default subscriptionPlanRoutes;
import { Router } from "express";
import authVerify from "../../middlewares/authVerify";
import { subscriptionPlanControllers } from "./subscriptionPlan.controller";
import { handleZodValidation } from "../../middlewares/handleZodValidation";
import { subscriptionPlanValidationSchema, updateSubscriptionPlanValidationSchema } from "./subscriptionPlan.validation";
import { userRoles } from "../../constants/global.constant";

const subscriptionPlanRouters = Router();

subscriptionPlanRouters.post("/", authVerify([userRoles.admin]), handleZodValidation(subscriptionPlanValidationSchema), subscriptionPlanControllers.createSubscriptionPlan);
subscriptionPlanRouters.get("/", authVerify([userRoles.admin, userRoles.companyAdmin]), subscriptionPlanControllers.getAllSubscriptionPlans);
subscriptionPlanRouters.get("/:id", authVerify([userRoles.admin, userRoles.companyAdmin]), subscriptionPlanControllers.getSingleSubscriptionPlan);
subscriptionPlanRouters.put("/:id", authVerify([userRoles.admin]), handleZodValidation(updateSubscriptionPlanValidationSchema), subscriptionPlanControllers.updateSubscriptionPlan);
subscriptionPlanRouters.delete("/:id", authVerify([userRoles.admin]), subscriptionPlanControllers.deleteSubscriptionPlan);

export default subscriptionPlanRouters;
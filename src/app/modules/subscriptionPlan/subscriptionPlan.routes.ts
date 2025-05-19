import { Router } from "express";
import authVerify from "../../middlewares/authVerify";
import { subscriptionPlanControllers } from "./subscriptionPlan.controller";
import { handleZodValidation } from "../../middlewares/handleZodValidation";
import { subscriptionPlanValidationSchema, updateSubscriptionPlanValidationSchema } from "./subscriptionPlan.validation";

const subscriptionPlanRouters = Router();

subscriptionPlanRouters.post("/", authVerify(["admin"]), handleZodValidation(subscriptionPlanValidationSchema), subscriptionPlanControllers.createSubscriptionPlan);
subscriptionPlanRouters.get("/", authVerify(["admin", "user"]), subscriptionPlanControllers.getAllSubscriptionPlans);
subscriptionPlanRouters.get("/:id", authVerify(["admin", "user"]), subscriptionPlanControllers.getSingleSubscriptionPlan);
subscriptionPlanRouters.put("/:id", authVerify(["admin"]), handleZodValidation(updateSubscriptionPlanValidationSchema), subscriptionPlanControllers.updateSubscriptionPlan);
subscriptionPlanRouters.delete("/:id", authVerify(["admin"]), subscriptionPlanControllers.deleteSubscriptionPlan);

export default subscriptionPlanRouters;
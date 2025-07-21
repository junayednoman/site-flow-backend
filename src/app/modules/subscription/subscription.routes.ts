import { Router } from "express";
import authVerify from "../../middlewares/authVerify";
import subscriptionControllers from "./subscription.controller";
import { userRoles } from "../../constants/global.constant";
import { handleZodValidation } from "../../middlewares/handleZodValidation";
import { subscriptionCreateSchema, updateSubscriptionValidationSchema } from "./subscription.validation";

const subscriptionRouters = Router();

subscriptionRouters.post("/create-subscription-checkout-session", authVerify([userRoles.companyAdmin]), handleZodValidation(subscriptionCreateSchema), subscriptionControllers.createSubscriptionCheckoutSession);
subscriptionRouters.get("/success", subscriptionControllers.subscriptionSuccess);
subscriptionRouters.get("/cancel", subscriptionControllers.subscriptionCancel);
subscriptionRouters.get('/', authVerify([userRoles.admin]), subscriptionControllers.getAllSubscriptions);
subscriptionRouters.get('/my', authVerify([userRoles.companyAdmin]), subscriptionControllers.getMySubscription);
subscriptionRouters.get('/:id', authVerify([userRoles.admin, userRoles.companyAdmin]), subscriptionControllers.getSingleSubscription);
subscriptionRouters.patch('/turn-on-auto-renewal/:stripeSubId', authVerify([userRoles.companyAdmin]), subscriptionControllers.turnOnAutoRenewal);
subscriptionRouters.patch('/turn-off-auto-renewal/:stripeSubId', authVerify([userRoles.companyAdmin]), subscriptionControllers.turnOffAutoRenewal);
subscriptionRouters.patch("/update-subscription", authVerify([userRoles.companyAdmin]), handleZodValidation(updateSubscriptionValidationSchema), subscriptionControllers.updateSubscription);

export default subscriptionRouters;
import { Router } from "express";
import authVerify from "../../middlewares/authVerify";
import subscriptionControllers from "./subscription.controller";
import { userRoles } from "../../constants/global.constant";

const subscriptionRouters = Router();

subscriptionRouters.get('/', authVerify([userRoles.admin]), subscriptionControllers.getAllSubscriptions);
subscriptionRouters.get('/my', authVerify([userRoles.companyAdmin]), subscriptionControllers.getMySubscription);
subscriptionRouters.get('/:id', authVerify([userRoles.admin]), subscriptionControllers.getSingleSubscription);

export default subscriptionRouters;
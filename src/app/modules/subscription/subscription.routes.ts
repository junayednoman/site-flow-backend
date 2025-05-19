import { Router } from "express";
import authVerify from "../../middlewares/authVerify";
import subscriptionControllers from "./subscription.controller";

const subscriptionRouters = Router();

subscriptionRouters.get('/', authVerify(["admin"]), subscriptionControllers.getAllSubscriptions);
subscriptionRouters.get('/my', authVerify(["user"]), subscriptionControllers.getMySubscription);
subscriptionRouters.get('/:id', authVerify(["admin"]), subscriptionControllers.getSingleSubscription);

export default subscriptionRouters;
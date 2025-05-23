import { Router } from "express";
import authVerify from "../../middlewares/authVerify";
import paymentControllers from "./payment.controller";
import { userRoles } from "../../constants/global.constant";

const paymentRouters = Router();

paymentRouters.post("/create-session-for-subscription", authVerify([userRoles.companyAdmin]), paymentControllers.createSessionForSubscription);
paymentRouters.get("/verify-session-for-subscription", paymentControllers.verifySubscriptionPayment);
paymentRouters.get("/", authVerify([userRoles.admin]), paymentControllers.getAllPayments);
paymentRouters.get("/:id", authVerify([userRoles.admin, userRoles.companyAdmin]), paymentControllers.getSinglePayment);

export default paymentRouters;
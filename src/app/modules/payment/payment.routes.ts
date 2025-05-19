import { Router } from "express";
import authVerify from "../../middlewares/authVerify";
import paymentControllers from "./payment.controller";

const paymentRouters = Router();

paymentRouters.post("/create-session-for-subscription", authVerify(["user"]), paymentControllers.createSessionForSubscription);
paymentRouters.get("/verify-session-for-subscription", paymentControllers.verifySubscriptionPayment);
paymentRouters.get("/", authVerify(["admin"]), paymentControllers.getAllPayments);
paymentRouters.get("/:id", authVerify(["admin", "user"]), paymentControllers.getSinglePayment);

export default paymentRouters;
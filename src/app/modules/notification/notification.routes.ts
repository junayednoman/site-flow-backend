import { Router } from "express";
import authVerify from "../../middlewares/authVerify";
import { notificationController } from "./notification.controller";

const notificationRouters = Router();

notificationRouters.post("/", authVerify(["athlete", "admin"]), notificationController.createNotification)
notificationRouters.get("/", authVerify(["athlete", "admin"]), notificationController.getAllNotifications)

notificationRouters.patch(
  "/:id", authVerify(["athlete", "admin"]),
  notificationController.markAsRead)

notificationRouters.patch(
  "/", authVerify(["athlete", "admin"]),
  notificationController.markAllAsRead)

export default notificationRouters;
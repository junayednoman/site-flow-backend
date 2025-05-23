import { Router } from "express";
import authVerify from "../../middlewares/authVerify";
import { notificationController } from "./notification.controller";
import { userRoles } from "../../constants/global.constant";

const notificationRouters = Router();

notificationRouters.post("/", authVerify([userRoles.admin, userRoles.companyAdmin, userRoles.employee]), notificationController.createNotification)
notificationRouters.get("/", authVerify([userRoles.admin, userRoles.companyAdmin, userRoles.employee]), notificationController.getAllNotifications)

notificationRouters.patch(
  "/:id", authVerify([userRoles.admin, userRoles.companyAdmin, userRoles.employee]),
  notificationController.markAsRead)

notificationRouters.patch(
  "/", authVerify([userRoles.admin, userRoles.companyAdmin, userRoles.employee]),
  notificationController.markAllAsRead)

export default notificationRouters;
import { Router } from "express";
import authVerify from "../../middlewares/authVerify";
import { notificationController } from "./notification.controller";
import { userRoles } from "../../constants/global.constant";

const notificationRouters = Router();

notificationRouters.post("/", authVerify([userRoles.admin, userRoles.companyAdmin, userRoles.projectManager, userRoles.supervisor]), notificationController.createNotification)
notificationRouters.get("/", authVerify([userRoles.admin, userRoles.companyAdmin, userRoles.projectManager, userRoles.supervisor]), notificationController.getAllNotifications)

notificationRouters.patch(
  "/:id", authVerify([userRoles.admin, userRoles.companyAdmin, userRoles.projectManager, userRoles.supervisor]),
  notificationController.markAsRead)

notificationRouters.patch(
  "/", authVerify([userRoles.admin, userRoles.companyAdmin, userRoles.projectManager, userRoles.supervisor]),
  notificationController.markAllAsRead)

export default notificationRouters;
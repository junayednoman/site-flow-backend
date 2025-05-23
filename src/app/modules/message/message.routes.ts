import { Router } from "express";
import authVerify from "../../middlewares/authVerify";
import messageControllers from "./message.controller";
import { userRoles } from "../../constants/global.constant";

const messageRouters = Router();

messageRouters.get("/:chatId", authVerify([userRoles.companyAdmin, userRoles.projectManager, userRoles.supervisor]), messageControllers.getMessages);
messageRouters.put("/:id", authVerify([userRoles.companyAdmin, userRoles.projectManager, userRoles.supervisor]), messageControllers.updateMessage);
messageRouters.delete("/:id", authVerify([userRoles.companyAdmin, userRoles.projectManager, userRoles.supervisor]), messageControllers.deleteMessage);

export default messageRouters;
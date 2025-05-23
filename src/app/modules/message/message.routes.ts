import { Router } from "express";
import authVerify from "../../middlewares/authVerify";
import messageControllers from "./message.controller";
import { userRoles } from "../../constants/global.constant";

const messageRouters = Router();

messageRouters.get("/:chatId", authVerify([userRoles.companyAdmin, userRoles.employee]), messageControllers.getMessages);
messageRouters.put("/:id", authVerify([userRoles.companyAdmin, userRoles.employee]), messageControllers.updateMessage);
messageRouters.delete("/:id", authVerify([userRoles.companyAdmin, userRoles.employee]), messageControllers.deleteMessage);

export default messageRouters;
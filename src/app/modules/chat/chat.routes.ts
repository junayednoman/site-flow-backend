import { Router } from "express";
import authVerify from "../../middlewares/authVerify";
import chatController from "./chat.controller";
import { handleZodValidation } from "../../middlewares/handleZodValidation";
import { chatValidationSchema } from "./chat.validation";
import { userRoles } from "../../constants/global.constant";

const chatRouters = Router();

chatRouters.post("/", authVerify([userRoles.companyAdmin, userRoles.employee]), handleZodValidation(chatValidationSchema), chatController.createChat);
chatRouters.get("/", authVerify([userRoles.companyAdmin, userRoles.employee]), chatController.getChats);
chatRouters.delete("/:id", authVerify([userRoles.companyAdmin, userRoles.employee]), chatController.deleteChat);

export default chatRouters;
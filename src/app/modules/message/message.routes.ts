import { Router } from "express";
import { userRoles } from "../../constants/global.constant";
import authVerify from "../../middlewares/authVerify";
import messageController from "./message.controller";
import { handleZodValidation } from "../../middlewares/handleZodValidation";
import { createMessageValidationSchema, updateMessageValidationSchema } from "./message.validation";

const messageRoutes = Router();

messageRoutes.post(
  "/:chatGroupId",
  authVerify([userRoles.companyAdmin, userRoles.employee]),
  handleZodValidation(createMessageValidationSchema),
  messageController.createMessage
);

messageRoutes.get(
  "/:chatGroupId",
  authVerify([userRoles.companyAdmin, userRoles.employee]),
  messageController.getChatMessages
);

messageRoutes.put(
  "/:messageId",
  authVerify([userRoles.companyAdmin, userRoles.employee]),
  handleZodValidation(updateMessageValidationSchema),
  messageController.updateMessage
);

messageRoutes.delete(
  "/:messageId",
  authVerify([userRoles.companyAdmin, userRoles.employee]),
  messageController.deleteMessage
);

export default messageRoutes;
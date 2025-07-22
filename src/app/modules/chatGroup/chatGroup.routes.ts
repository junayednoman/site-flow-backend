import { Router } from "express";
import { userRoles } from "../../constants/global.constant";
import authVerify from "../../middlewares/authVerify";
import chatGroupController from "./chatGroup.controller";
import { handleZodValidation } from "../../middlewares/handleZodValidation";
import { addParticipantValidationSchema, createChatGroupValidationSchema } from "./chatGroup.validation";

const chatGroupRoutes = Router();

chatGroupRoutes.post(
  "/",
  authVerify([userRoles.companyAdmin]),
  handleZodValidation(createChatGroupValidationSchema),
  chatGroupController.createChatGroup
);

chatGroupRoutes.post(
  "/:groupId/add-participant",
  authVerify([userRoles.companyAdmin]),
  handleZodValidation(addParticipantValidationSchema),
  chatGroupController.addParticipant
);

chatGroupRoutes.post(
  "/:groupId/remove-participant",
  authVerify([userRoles.companyAdmin]),
  handleZodValidation(addParticipantValidationSchema),
  chatGroupController.removeParticipant
);

chatGroupRoutes.post(
  "/:groupId/update-last-message",
  authVerify([userRoles.companyAdmin, userRoles.employee]),
  chatGroupController.updateLastMessage
);

chatGroupRoutes.get(
  "/:groupId",
  authVerify([userRoles.companyAdmin, userRoles.employee]),
  chatGroupController.getChatGroup
);

chatGroupRoutes.get(
  "/project/:projectId",
  authVerify([userRoles.companyAdmin, userRoles.employee]),
  chatGroupController.getProjectsChatList
);


export default chatGroupRoutes;
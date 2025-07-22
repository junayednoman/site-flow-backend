import handleAsyncRequest from "../../utils/handleAsyncRequest";
import { successResponse } from "../../utils/successResponse";
import chatGroupService from "./chatGroup.service";

const createChatGroup = handleAsyncRequest(async (req: any, res) => {
  const { project } = req.body;
  const admin_id = req.user.id;
  const result = await chatGroupService.createChatGroup(admin_id, project);
  successResponse(res, {
    message: "Chat group created successfully!",
    data: result,
    status: 201,
  });
});

const addParticipant = handleAsyncRequest(async (req: any, res) => {
  const { groupId } = req.params;
  const { user_id } = req.body;
  const result = await chatGroupService.addParticipant(groupId, user_id);
  successResponse(res, {
    message: "Participant added successfully!",
    data: result,
  });
});

const removeParticipant = handleAsyncRequest(async (req: any, res) => {
  const { groupId } = req.params;
  const { user_id } = req.body;
  const admin_id = req.user.id
  const result = await chatGroupService.removeParticipant(groupId, user_id, admin_id);
  successResponse(res, {
    message: "Participant removed successfully!",
    data: result,
  });
});

const updateLastMessage = handleAsyncRequest(async (req: any, res) => {
  const { group_id } = req.params;
  const { message_id } = req.body;
  const result = await chatGroupService.updateLastMessage(group_id, message_id);
  successResponse(res, {
    message: "Last message updated successfully!",
    data: result,
  });
});

const getChatGroup = handleAsyncRequest(async (req: any, res) => {
  const { groupId } = req.params;
  const result = await chatGroupService.getChatGroup(groupId);
  successResponse(res, {
    message: "Chat group retrieved successfully!",
    data: result,
  });
});

const getProjectsChatList = handleAsyncRequest(async (req: any, res) => {
  const query = req.query;
  const project_id = req.params.projectId;
  const result = await chatGroupService.getProjectsChatList(project_id, query);
  successResponse(res, {
    message: "Chat groups retrieved successfully!",
    data: result,
  });
});

const chatGroupController = {
  createChatGroup,
  addParticipant,
  removeParticipant,
  updateLastMessage,
  getChatGroup,
  getProjectsChatList
};

export default chatGroupController;
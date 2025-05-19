import handleAsyncRequest from "../../utils/handleAsyncRequest";
import { successResponse } from "../../utils/successResponse";
import chatServices from "./chat.service";

const createChat = handleAsyncRequest(async (req: any, res) => {
  const id = req.user.id;
  const recipientId = req.body.recipientId;
  const result = await chatServices.createChat(id, recipientId);
  successResponse(res, {
    message: 'Chat created successfully!',
    data: result,
    status: 201
  });
});

const getChats = handleAsyncRequest(async (req: any, res) => {
  const id = req.user?.id;
  const query = req.query;
  const result = await chatServices.getChats(id, query);
  successResponse(res, {
    message: 'Chats retrieved successfully!',
    data: result
  });
});

const deleteChat = handleAsyncRequest(async (req, res) => {
  const id = req.params.id;
  const result = await chatServices.deleteChat(id);
  successResponse(res, {
    message: 'Chat deleted successfully!',
    data: result
  });
});

const chatControllers = {
  createChat,
  getChats,
  deleteChat
}

export default chatControllers;
import handleAsyncRequest from "../../utils/handleAsyncRequest";
import { successResponse } from "../../utils/successResponse";
import messageServices from "./message.service";

const getMessages = handleAsyncRequest(async (req: any, res) => {
  const chatId = req.params.chatId;
  const query = req.query;
  const result = await messageServices.getMessages(chatId, query);
  successResponse(res, {
    message: 'Messages retrieved successfully!',
    data: result
  });
});

const updateMessage = handleAsyncRequest(async (req: any, res) => {
  const id = req.params.id;
  const text = req.body.text;
  const result = await messageServices.updateMessage(id, text);
  successResponse(res, {
    message: 'Message updated successfully!',
    data: result
  });
});

const deleteMessage = handleAsyncRequest(async (req: any, res) => {
  const id = req.params.id;
  const result = await messageServices.deleteMessage(id);
  successResponse(res, {
    message: 'Message deleted successfully!',
    data: result
  });
});

const messageControllers = {
  getMessages,
  updateMessage,
  deleteMessage
};

export default messageControllers;
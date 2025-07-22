import handleAsyncRequest from "../../utils/handleAsyncRequest";
import { successResponse } from "../../utils/successResponse";
import messageService from "./message.service";

const createMessage = handleAsyncRequest(async (req: any, res) => {
  const { chatGroupId } = req.params;
  const { content } = req.body;
  const { file } = req.body;
  const senderId = req.user.id;
  const result = await messageService.createMessage(chatGroupId, senderId, content, file);
  successResponse(res, {
    message: "Message sent successfully!",
    data: result,
    status: 201,
  });
});

const getChatMessages = handleAsyncRequest(async (req: any, res) => {
  const { chatGroupId } = req.params;
  const query = req.query;
  const result = await messageService.getChatMessages(chatGroupId, query);
  successResponse(res, {
    message: "Messages retrieved successfully!",
    data: result,
    status: 200,
  });
});

const updateMessage = handleAsyncRequest(async (req: any, res) => {
  const { messageId } = req.params;
  const { content } = req.body;
  const senderId = req.user.id;
  const result = await messageService.updateMessage(messageId, senderId, content);
  successResponse(res, {
    message: "Message updated successfully!",
    data: result,
    status: 200,
  });
});

const deleteMessage = handleAsyncRequest(async (req: any, res) => {
  const { messageId } = req.params;
  const senderId = req.user.id;
  const result = await messageService.deleteMessage(messageId, senderId);
  successResponse(res, {
    message: result.message,
    status: 200,
  });
});

const messageController = {
  createMessage,
  getChatMessages,
  updateMessage,
  deleteMessage,
};

export default messageController;
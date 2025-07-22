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
  });
});

const deleteMessage = handleAsyncRequest(async (req: any, res) => {
  const { messageId } = req.params;
  const senderId = req.user.id;
  const result = await messageService.deleteMessage(messageId, senderId);
  successResponse(res, {
    message: result.message,
  });
});

const seenAllMessages = handleAsyncRequest(async (req: any, res) => {
  const { chatGroupId } = req.params;
  const userId = req.user.id;
  const result = await messageService.seenAllMessages(chatGroupId, userId);
  successResponse(res, {
    message: "Messages seen successfully!",
    data: result,
  });
});

const messageController = {
  createMessage,
  getChatMessages,
  updateMessage,
  deleteMessage,
  seenAllMessages
};

export default messageController;
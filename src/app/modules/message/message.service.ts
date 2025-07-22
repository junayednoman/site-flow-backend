import Message from './message.model';
import { AppError } from '../../classes/appError';
import { TMessage } from './message.interface';
import ChatGroup from '../chatGroup/chatGroup.model';
import chatGroupService from '../chatGroup/chatGroup.service';
import QueryBuilder from '../../classes/queryBuilder';
import { ObjectId } from 'mongoose';

const createMessage = async (chatGroupId: string, senderId: string, content: string, file?: string): Promise<TMessage> => {
  const chatGroup = await ChatGroup.findById(chatGroupId);
  if (!chatGroup) throw new AppError(404, "Chat group not found!");
  if (!chatGroup.participants.includes(senderId as unknown as ObjectId)) throw new AppError(403, "User is not a participant of this chat group!");

  const message = await Message.create({ chat_group: chatGroupId, sender: senderId, content, file });
  await chatGroupService.updateLastMessage(chatGroupId, message._id.toString());
  return message;
};

const getChatMessages = async (chatGroupId: string, query: Record<string, any>) => {
  const searchableFields = ['content'];
  const messageQuery = new QueryBuilder(
    Message.find({ chat_group: chatGroupId }),
    query
  )
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .selectFields();

  const meta: any = await messageQuery.countTotal();
  const result: any = (await messageQuery.queryModel.populate([
    {
      path: "sender", select: "user_type user",
      populate: { path: "user", select: "name type image" }
    },
  ]).lean()).reverse();
  return { data: result, meta };
};

const updateMessage = async (messageId: string, senderId: string, content: string): Promise<TMessage> => {
  const message = await Message.findOne({ _id: messageId, sender: senderId });
  if (!message) throw new AppError(404, "Message not found or you are not authorized to edit it!");

  message.content = content;
  await message.save();
  return message;
};

const deleteMessage = async (messageId: string, senderId: string): Promise<{ message: string }> => {
  const message = await Message.findOne({ _id: messageId, sender: senderId });
  if (!message) throw new AppError(404, "Message not found or you are not authorized to delete it!");

  await message.deleteOne();
  return { message: "Message deleted successfully!" };
};

export default { createMessage, getChatMessages, updateMessage, deleteMessage };
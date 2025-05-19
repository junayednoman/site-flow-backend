import mongoose, { ObjectId } from "mongoose";
import { AppError } from "../../classes/appError";
import QueryBuilder from "../../classes/queryBuilder";
import Chat from "../chat/chat.model";
import { TMessage } from "./message.interface";
import Message from "./message.model";

const createMessage = async (payload: TMessage) => {
  let chat = await Chat.findById(payload.chat);
  if (!chat) {
    chat = await Chat.create({ participants: [payload.sender, payload.receiver] });
    payload.chat = chat._id as unknown as ObjectId;
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const message = await Message.create([payload], { session });
    await Chat.findByIdAndUpdate(chat._id, { last_message: message[0]?._id }, { session });

    await session.commitTransaction();
    return message;
  } catch (error: any) {
    await session.abortTransaction();
    throw new AppError(400, error?.message || "Failed to create message!");
  } finally {
    session.endSession();
  }
}

const getMessages = async (chatId: string, query: Record<string, any>) => {
  const searchableFields = [
    "text"
  ];
  const messageQuery = new QueryBuilder(
    Message.find({ chat: chatId }),
    query
  )
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .selectFields();

  const meta = await messageQuery.countTotal();
  const result = await messageQuery.queryModel.sort({ createdAt: 1 });
  return { data: result, meta };
};

const updateMessage = async (id: string, text: string) => {
  const message = await Message.findById(id);
  if (!message) throw new AppError(404, "Message not found!");
  message.text = text;
  const result = await message.save();
  return result;
};

const deleteMessage = async (id: string) => {
  const message = await Message.findById(id);
  if (!message) throw new AppError(404, "Message not found!");
  const result = await Message.findByIdAndDelete(id);
  return result;
}

const messageServices = {
  createMessage,
  getMessages,
  updateMessage,
  deleteMessage
};
export default messageServices;
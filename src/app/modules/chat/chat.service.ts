import { AppError } from "../../classes/appError";
import Auth from "../auth/auth.model";
import Chat from "./chat.model";

const createChat = async (currentUserId: string, recipientId: string) => {
  const recipientUser = await Auth.findOne({ _id: recipientId, is_blocked: false, is_deleted: false });
  if (!recipientUser) throw new AppError(400, "Invalid recipient id!");

  const chat = await Chat.findOne({ participants: { $all: [currentUserId, recipientUser._id] } });
  if (chat) return chat;
  const result = await Chat.create({ participants: [currentUserId, recipientUser._id] });
  return result;
}

const getChats = async (currentUserId: string, query: Record<string, any>) => {
  const pipeline = [
    {
      $match: {
        participants: { $in: [currentUserId] },
        is_deleted: false
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "participants",
        foreignField: "_id",
        as: "participants"
      }
    },
    {
      $project: {
        "participants._id": 1,
        "participants.name": 1,
        "participants.image": 1
      }
    },
    {
      $sort: {
        updatedAt: -1
      }
    }
  ] as any;

  if (query?.searchTerm) {
    pipeline.push(
      {
        $match: {
          "participants.name": { $regex: query?.searchTerm, $options: "i" }
        }
      }
    )
  }
  const chats = await Chat.aggregate(pipeline)

  return chats;
}

const deleteChat = async (id: string) => {
  const chat = await Chat.findById(id);
  if (!chat) throw new AppError(404, "Chat not found!");
  const result = await Chat.findByIdAndDelete(id);
  return result;
}

const chatServices = {
  createChat,
  getChats,
  deleteChat
}
export default chatServices;
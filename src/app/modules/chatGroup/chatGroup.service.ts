import ChatGroup from './chatGroup.model';
import { AppError } from '../../classes/appError';
import Message from '../message/message.model';
import Project from '../project/project.model';
import mongoose, { ObjectId } from 'mongoose';
import QueryBuilder from '../../classes/queryBuilder';
import Auth from '../auth/auth.model';
import AggregationBuilder from '../../classes/AggregationBuilder';

const createChatGroup = async (user_id: string, project_id: string) => {
  const project = await Project.findById(project_id);
  if (!project) throw new AppError(404, "Project not found!");
  if (project.company_admin.toString() !== user_id) throw new AppError(403, "Only the project admin can create the chat group!");

  const participants = [project.company_admin, project.supervisor, project.manager];
  const existingGroup = await ChatGroup.findOne({ project: project_id });
  if (existingGroup) throw new AppError(400, "Chat group for this project already exists!");

  const chatGroup = await ChatGroup.create({ project: project_id, participants });
  return chatGroup;
};

const addParticipant = async (group_id: string, user_id: ObjectId) => {
  const chatGroup = await ChatGroup.findById(group_id);
  if (!chatGroup) throw new AppError(404, "Chat group not found!");
  const user = await Auth.findById(user_id);
  if (!user) throw new AppError(404, "User not found!");
  if (chatGroup.participants.includes(user_id)) throw new AppError(400, "User is already a participant!");
  chatGroup.participants.push(user_id);
  await chatGroup.save();
  return chatGroup;
};

const getProjectsChatList = async (project_id: string, query: Record<string, any>) => {
  const searchableFields = ["name"];
  query.project = project_id
  const userQuery = new QueryBuilder(
    ChatGroup.find(),
    query
  )
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .selectFields();

  const meta = await userQuery.countTotal();
  const result = await userQuery.queryModel.populate("last_message", "content createdAt sender seen").lean();
  return { data: result, meta };
}

const getMyChatList = async (userId: string, query: Record<string, any>) => {
  const searchableFields = ["name"];

  // Ensure participants filter
  query.participants = new mongoose.Types.ObjectId(userId);

  const chatAggregation = new AggregationBuilder(ChatGroup, [], query)
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .selectFields();

  // Count for meta
  const meta = await chatAggregation.countTotal();

  // Execute aggregation
  let result = await chatAggregation.execute();

  // Manual population equivalent with $lookup
  result = await ChatGroup.aggregate([
    ...chatAggregation['pipeline'],
    {
      $lookup: {
        from: "messages",
        let: { chatGroupId: "$_id", userId: new mongoose.Types.ObjectId(userId) },
        pipeline: [
          { $match: { $expr: { $eq: ["$chat_group", "$$chatGroupId"] } } },
          {
            $facet: {
              lastMessage: [
                { $sort: { createdAt: -1 } },
                { $limit: 1 }
              ],
              unseenCount: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $ne: ["$sender", "$$userId"] },                     // exclude messages I sent
                        { $not: [{ $in: ["$$userId", "$seen_by"] }] }       // and not seen by me
                      ]
                    }
                  }
                },
                { $count: "count" }
              ]
            }
          }
        ],
        as: "messagesInfo"
      }
    },
    {
      $addFields: {
        last_message: { $arrayElemAt: ["$messagesInfo.lastMessage", 0] },
        unSeenMessageCount: {
          $ifNull: [{ $arrayElemAt: ["$messagesInfo.unseenCount.count", 0] }, 0]
        }
      }
    },
    {
      $lookup: {
        from: "projects",
        localField: "project",
        foreignField: "_id",
        as: "project"
      }
    },
    { $unwind: { path: "$project", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        "last_message.content": 1,
        "last_message.file": 1,
        "last_message.createdAt": 1,
        "last_message.sender": 1,
        "last_message.seen_by": 1,
        "project.name": 1,
        unSeenMessageCount: 1
      }
    }
  ]);

  return { data: result, meta };
};

const removeParticipant = async (group_id: string, user_id: string, admin_id: string) => {
  const chatGroup = await ChatGroup.findById(group_id);
  if (!chatGroup) throw new AppError(404, "Chat group not found!");
  const project = await Project.findById(chatGroup.project);
  if (!project || project.company_admin.toString() !== admin_id) throw new AppError(403, "Only the project admin can remove participants!");

  if (!chatGroup.participants.includes(user_id as unknown as ObjectId)) throw new AppError(400, "User is not a participant!");
  chatGroup.participants = chatGroup.participants.filter(id => id.toString() !== user_id);
  await chatGroup.save();
  return chatGroup;
};

const updateLastMessage = async (group_id: string, message_id: string) => {
  const message = await Message.findById(message_id);
  if (!message) throw new AppError(404, "Message not found!");

  const chatGroup = await ChatGroup.findById(group_id);
  if (!chatGroup) throw new AppError(404, "Chat group not found!");
  if (message.chat_group.toString() !== group_id) throw new AppError(400, "Message does not belong to this group!");

  chatGroup.last_message = message_id as unknown as ObjectId;
  await chatGroup.save();
  return chatGroup;
};

const getChatGroup = async (group_id: string) => {
  const chatGroup = await ChatGroup.findById(group_id)
    .populate('project', 'name')
    .populate('participants', 'name email')
    .populate('last_message', 'content createdAt sender')
    .lean();
  return chatGroup;
};

export default { createChatGroup, addParticipant, removeParticipant, updateLastMessage, getChatGroup, getProjectsChatList, getMyChatList };
import { ObjectId } from "mongoose";
import QueryBuilder from "../../classes/queryBuilder";
import Notification from "./notification.model";
import generateOTP from "../../utils/generateOTP";

const createNotification = async (id: string) => {
  const otp = generateOTP()
  const notificationData = {
    receiver: id as unknown as ObjectId,
    title: `New Notification-${otp}`,
    body: 'You have a new notification',
  }
  const result = await Notification.create(notificationData);
  return result;
}

const getAllNotifications = async (query: Record<string, any>, id: string) => {
  const searchableFields = ['']
  const notificationQuery = new QueryBuilder(Notification.find({ receiver: id }), query)
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .selectFields()

  const meta = await notificationQuery.countTotal();
  const result = await notificationQuery.queryModel;
  return { data: result, meta };
}

const markAsRead = async (id: string) => {
  const notification = await Notification.findById(id);
  if (!notification) throw new Error('Invalid notification id!');
  if (notification.has_read) return;
  const result = await Notification.findByIdAndUpdate(id, { has_read: true }, { new: true });
  return result;
};

const markAllAsRead = async (id: string) => {
  const result = await Notification.updateMany({ has_read: false, receiver: id }, { has_read: true });
  return result;
}

export const notificationServices = { markAsRead, getAllNotifications, markAllAsRead, createNotification };
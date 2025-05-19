import handleAsyncRequest from "../../utils/handleAsyncRequest";
import { successResponse } from "../../utils/successResponse";
import { notificationServices } from "./notification.service";

const createNotification = handleAsyncRequest(
  async (req: any, res) => {
    const id = req?.user.id;
    const result = await notificationServices.createNotification(id);
    successResponse((res), {
      message: "Notifications created successfully!",
      data: result
    })
  }
)

const getAllNotifications = handleAsyncRequest(
  async (req: any, res) => {
    const query = req.query;
    const id = req.user.id;
    const result = await notificationServices.getAllNotifications(query, id);
    successResponse((res), {
      message: "Notifications retrieved successfully!",
      data: result
    })
  }
)

const markAsRead = handleAsyncRequest(
  async (req, res) => {
    const id = req.params.id;
    const result = await notificationServices.markAsRead(id);
    successResponse((res), {
      message: "Notification marked as read successfully!",
      data: result
    })
  }
)

const markAllAsRead = handleAsyncRequest(
  async (req: any, res) => {
    const id = req.user.id;
    const result = await notificationServices.markAllAsRead(id);
    successResponse((res), {
      message: "All notification marked as read successfully!",
      data: result
    })
  }
)

export const notificationController = {
  markAsRead,
  getAllNotifications,
  markAllAsRead,
  createNotification
}
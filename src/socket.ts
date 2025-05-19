import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { AppError } from "./app/classes/appError";
import verifyJWT from "./app/utils/verifyJWT";
import { TMessage } from "./app/modules/message/message.interface";
import { ObjectId } from "mongoose";
import Friends from "./app/modules/friends/friends.model";
import User from "./app/modules/user/user.model";
import messageServices from "./app/modules/message/message.service";
import Notification from "./app/modules/notification/notification.model";
import Auth from "./app/modules/auth/auth.model";

const initializeSocketIO = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: "*"
    },
  })

  // store online users
  const onlineUsers = new Set();

  io.on("connection", async (socket) => {
    try {
      // extract the token
      const authHeader =
        socket.handshake.auth.token || socket.handshake.headers.token
      if (!authHeader) {
        throw new AppError(401, "Unauthorized");
      }
      const token = authHeader.split("Bearer ")[1];

      if (!token) throw new AppError(401, 'Unauthorized')

      let user: any;

      // try {
      const decoded = verifyJWT(token);
      if (!decoded) throw new AppError(401, 'Unauthorized');
      if (decoded.role === "user") {
        user = await User.findOne({ email: decoded.email, is_deleted: false, is_blocked: false });
      } else if (decoded.role === "admin") {
        user = await Auth.findOne({ role: "admin" });
      }

      // add the user to the onlineUser set
      onlineUsers.add(user?.id?.toString())
      // filter online users only within friend list
      const friends = await Friends.find({ $or: [{ sender: user?._id }, { receiver: user?._id }], status: "accepted" }).select("sender receiver");

      const onlineFriends = Array.from(onlineUsers).filter(id => friends.some(friend => friend.sender.toString() === id || friend.receiver.toString() === id));
      io.emit("online-users", onlineFriends)

      // check if user is online
      socket.on("check-online", (payload: { id: string }) => {
        const isOnline = Array.from(onlineUsers).includes(payload?.id?.toString());
        io.emit(`user-status::${payload?.id}`, isOnline);
      })

      const isOnline = Array.from(onlineUsers).includes(user?.id?.toString());
      io.emit(`user-status::${user?.id}`, isOnline);

      // messaging
      socket.on("send-message", async (data: TMessage) => {
        data.sender = user?.id as unknown as ObjectId;

        await messageServices.createMessage(data);
        io.emit(`receive-message::${data.receiver}`, data);
      });

      socket.on("update-message", async (payload: { id: string, text: string }) => {
        const result = await messageServices.updateMessage(payload.id, payload.text);
        io.emit(`updated-message::${result.chat}`, payload);
      })

      // handle notifications
      type TNotification = { title: string, body: string, link?: string, receiver?: string, is_admin_receiver?: boolean };
      socket.on("send-notification", async (data: TNotification) => {
        if (data?.is_admin_receiver) {
          const admin = await Auth.findOne({ role: "admin" });
          if (!admin) return;
          data.receiver = admin._id as unknown as string;
        }
        const result = await Notification.create(data);
        io.emit(`receive-notification::${data.receiver}`, { notification: result, count: 3 });
        const count = await Notification.countDocuments({ receiver: data.receiver, has_read: false });
        io.emit(`notification-count::${data.receiver}`, count);
      })

      socket.on("get-notification-count", async (userId: string) => {
        const count = await Notification.countDocuments({ receiver: userId, has_read: false });
        io.emit(`notification-count::${userId}`, count);
      });

      socket.on("read-notification", async (userId: string) => {
        await Notification.updateMany({ receiver: userId, has_read: false }, { has_read: true });
        io.emit(`notification-count::${userId}`, 0);
      });


      // handle socket disconnection
      socket.on("disconnect", () => {
        onlineUsers.delete(user?.id?.toString())
        const onlineFriends = Array.from(onlineUsers).filter(id => friends.some(friend => friend.sender.toString() === id || friend.receiver.toString() === id));
        io.emit("online-users", onlineFriends)

        const isOnline = Array.from(onlineUsers).includes(user?.id?.toString());
        io.emit(`user-status::${user?.id}`, isOnline);
      })
    } catch (error: any) {
      console.log('error', error?.message || "Error occurred in socket!");
    }
  });

  return io;
};

export default initializeSocketIO;
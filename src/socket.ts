import { Server as HttpServer } from 'http';
import { Server as IOServer, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongoose';
import config from './app/config';
import { AppError } from './app/classes/appError';
import ChatGroup from './app/modules/chatGroup/chatGroup.model';
import messageService from './app/modules/message/message.service';
import Message from './app/modules/message/message.model';
import chatGroupService from './app/modules/chatGroup/chatGroup.service';

// Initialize Socket.IO
export const initializeSocket = (server: HttpServer) => {
  const io = new IOServer(server, {
    cors: {
      origin: config.origin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Namespace for chat
  const chatNamespace = io.of('/chat');

  // Middleware for authentication
  chatNamespace.use(async (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.split(' ')[1];
    if (!token) {
      return next(new AppError(401, 'Authentication token required'));
    }

    try {
      const decoded = jwt.verify(token, config.jwt_access_secret as string) as { id: string; role: string };
      socket.data.userId = decoded.id;
      socket.data.role = decoded.role;
      next();
    } catch (error) {
      next(new AppError(401, error instanceof Error ? error.message : 'Invalid or expired token'));
    }
  });

  // Connection handler
  chatNamespace.on('connection', (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, { userId: string; role: string }>) => {
    const userId = socket.data.userId;
    // const role = socket.data.role;

    // console.log(`User ${userId} connected with role ${role}`);

    // Join rooms for all chat groups the user is part of
    const joinChatGroups = async () => {
      try {
        const chatGroups = await ChatGroup.find({ participants: userId }).select('_id');
        chatGroups.forEach((group) => {
          socket.join(group._id.toString());
          // console.log(`User ${userId} joined room ${group._id}`);
        });
      } catch (error) {
        console.error('Error joining chat groups:', error);
      }
    };

    joinChatGroups();

    // Handle new message
    socket.on('sendMessage', async ({ chatGroupId, content, file }: { chatGroupId: string; content: string; file?: string }) => {
      try {
        const chatGroup = await ChatGroup.findById(chatGroupId);
        if (!chatGroup) throw new AppError(404, 'Chat group not found');
        if (!chatGroup.participants.includes(userId as unknown as ObjectId)) throw new AppError(403, 'Unauthorized access to chat group');

        const message = await messageService.createMessage(chatGroupId, userId, content, file);
        const populatedMessage = await Message.findById(message._id).populate('sender', 'name email').lean();

        // Broadcast to all participants in the room
        chatNamespace.to(chatGroupId).emit('newMessage', {
          message: populatedMessage,
          senderId: userId,
        });

        // Update last message for the group
        await chatGroupService.updateLastMessage(chatGroupId, message._id!.toString());
      } catch (error) {
        socket.emit('error', { message: (error as AppError).message, status: (error as AppError).statusCode || 500 });
      }
    });

    // Handle marking all messages as seen
    socket.on('seenAllMessages', async ({ chatGroupId }: { chatGroupId: string }) => {
      try {
        const chatGroup = await ChatGroup.findById(chatGroupId);
        if (!chatGroup) throw new AppError(404, 'Chat group not found');
        if (!chatGroup.participants.includes(userId as unknown as ObjectId)) throw new AppError(403, 'Unauthorized access to chat group');

        await messageService.seenAllMessages(chatGroupId, userId);
        chatNamespace.to(chatGroupId).emit('messagesSeen', { chatGroupId, userId });
      } catch (error) {
        socket.emit('error', { message: (error as AppError).message, status: (error as AppError).statusCode || 500 });
      }
    });

    // Handle user joining a new chat group
    socket.on('joinChatGroup', async ({ chatGroupId }: { chatGroupId: string }) => {
      try {
        const chatGroup = await ChatGroup.findById(chatGroupId);
        if (!chatGroup) throw new AppError(404, 'Chat group not found');
        if (!chatGroup.participants.includes(userId as unknown as ObjectId)) throw new AppError(403, 'Unauthorized access to chat group');

        socket.join(chatGroupId);
        // console.log(`User ${userId} joined room ${chatGroupId}`);
        // Optionally send initial messages or group info
        const messages = await messageService.getChatMessages(chatGroupId, { limit: 50, page: 1 });
        socket.emit('initialMessages', messages);
      } catch (error) {
        socket.emit('error', { message: (error as AppError).message, status: (error as AppError).statusCode || 500 });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      // console.log(`User ${userId} disconnected`);
    });
  });

  return io;
};

export default initializeSocket;
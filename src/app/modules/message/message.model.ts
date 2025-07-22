import mongoose from 'mongoose';
import { TMessage } from './message.interface';

const MessageSchema = new mongoose.Schema<TMessage>({
  chat_group: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatGroup', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', required: true },
  content: { type: String, required: true },
  file: { type: String },
  seen: { type: Boolean, default: false },
}, {
  timestamps: true,
});

const Message = mongoose.model<TMessage>('Message', MessageSchema);
export default Message;
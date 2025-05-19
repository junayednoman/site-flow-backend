import mongoose, { Schema } from 'mongoose';
import { TMessage } from './message.interface';

const messageSchema = new Schema<TMessage>({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auth',
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auth',
    required: true,
  },
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  seen: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Message = mongoose.model<TMessage>('Message', messageSchema);

export default Message;

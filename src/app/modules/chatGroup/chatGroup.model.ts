import mongoose from 'mongoose';
import { TGroupChat } from './chatGroup.interface';

const ChatGroupSchema = new mongoose.Schema<TGroupChat>({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, unique: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Auth', required: true }],
  last_message: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
}, {
  timestamps: true,
});

const ChatGroup = mongoose.model('ChatGroup', ChatGroupSchema);
export default ChatGroup;
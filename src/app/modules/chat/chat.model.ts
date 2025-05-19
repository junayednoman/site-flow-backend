import { model, Schema } from "mongoose";
import { TChat } from "./chat.interface";

const chatSchema = new Schema<TChat>({
  participants: {
    type: [Schema.Types.ObjectId],
    ref: 'Auth',
    required: true,
  },
  last_message: {
    type: Schema.Types.ObjectId,
    default: null,
    is_deleted: { type: Boolean, default: false },
  }
}, {
  timestamps: true
});

const Chat = model<TChat>('Chat', chatSchema);

export default Chat;
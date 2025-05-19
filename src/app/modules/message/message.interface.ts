import { ObjectId } from "mongoose"

export type TMessage = {
  sender: ObjectId;
  receiver: ObjectId;
  chat: ObjectId;
  text: string;
  seen: boolean;
}
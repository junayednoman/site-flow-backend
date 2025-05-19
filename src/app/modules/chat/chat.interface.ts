import { ObjectId } from "mongoose";

export type TChat = {
  participants: ObjectId[];
  last_message: ObjectId;
  is_deleted: boolean;
};
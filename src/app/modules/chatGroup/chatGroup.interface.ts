import { ObjectId } from "mongoose";

export type TGroupChat = {
  project: ObjectId;
  participants: ObjectId[];
  last_message: ObjectId;
}
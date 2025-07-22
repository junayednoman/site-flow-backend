import { ObjectId } from 'mongoose';

export type TMessage = {
  _id?: ObjectId;
  chat_group: ObjectId;
  sender: ObjectId;
  content: string;
  file: string;
  seen: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};
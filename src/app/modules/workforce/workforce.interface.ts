import { ObjectId } from 'mongoose';

export type TWorkforce = {
  project: ObjectId;
  name: string;
  quantity: number;
  is_deleted: boolean;
};

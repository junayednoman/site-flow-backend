import { ObjectId } from 'mongoose';

export type TEquipment = {
  project: ObjectId;
  name: string;
  quantity: number;
  is_deleted: boolean;
};

import { ObjectId } from 'mongoose';

export type TEquipment = {
  project: ObjectId;
  name: string;
  initial_quantity: number;
  quantity: number;
  is_deleted: boolean;
};

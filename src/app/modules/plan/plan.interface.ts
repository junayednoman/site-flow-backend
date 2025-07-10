import { ObjectId } from "mongoose";

export type TWorkforceTask = {
  workforce: ObjectId;
  quantity: number;
  duration: string;
};

export type TEquipmentTask = {
  equipment: ObjectId;
  quantity: number;
  duration: string;
};

export type TTask = {
  name: string;
  workforces: TWorkforceTask[];
  equipments: TEquipmentTask[];
};

export type TPlan = {
  added_by: ObjectId;
  project: ObjectId;
  name: string;
  due_date?: Date;
  due_time?: Date;
  tasks: TTask[];
};

export type TTaskPayload = { name: string, workforces?: { workforce: ObjectId, quantity: number, duration: string }[], equipments?: { equipment: ObjectId, quantity: number, duration: string }[] }
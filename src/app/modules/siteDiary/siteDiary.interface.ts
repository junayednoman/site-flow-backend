import { ObjectId } from "mongoose";

export type TSiteDiary = {
  added_by: ObjectId;
  name: string;
  project: ObjectId;
  description: string;
  date: Date;
  weather_condition: string;
  duration: string;
  tasks: {
    name: string;
    workforces: {
      workforce: ObjectId;
      quantity: number;
      duration: string;
    }[];
    equipments: {
      equipment: ObjectId;
      quantity: number;
      duration: string;
    }[];
  }[];
  image?: string;
  location: string;
  delay?: string;
  comment?: string;
};

export type TTaskPayload = { name: string, workforces?: { workforce: ObjectId, quantity: number, duration: string }[], equipments?: { equipment: ObjectId, quantity: number, duration: string }[] }
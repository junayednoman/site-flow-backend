import { ObjectId } from "mongoose";

export type TDayWork = {
  name: string;
  project: ObjectId;
  description: string;
  date: Date;
  duration: string;
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
  materials: string;
  image?: string;
  location: string;
  delay?: string;
  comment?: string;
};

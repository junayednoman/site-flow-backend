import { Types } from 'mongoose';

export type TFile = {
  name: string;
  url: string;
};

export type TFolder = {
  _id?: Types.ObjectId;
  name: string;
  project: Types.ObjectId;
  files: TFile[];
  added_by?: Types.ObjectId;
};
import { ObjectId } from 'mongoose';

export type TInspectionDetail = {
  inspection: boolean;
  comment?: string;
};

export type TPostPourInspectionReport = {
  _id?: ObjectId;
  project: ObjectId;
  pour_no: string;
  pour_date: Date;
  inspection_date: Date;
  drawing_no: string;
  ga_drawing: string;
  temporary_works: string;
  pour_reference: string;
  setting_out: {
    line: boolean;
    inspection: boolean;
    comment?: string;
  };
  concrete_finish_type: TInspectionDetail;
  chamfers_edging_etc: TInspectionDetail;
  drainage_elements: TInspectionDetail;
  holding_down_bolts: TInspectionDetail;
  crack_inducers: TInspectionDetail;
  waterproofing_membrane: TInspectionDetail;
  others: TInspectionDetail;
  comment?: string;
  signed_on_completion_signature?: string; // URL to the uploaded image
  client_approved_signature?: string; // URL to the uploaded image
  updated_by?: ObjectId;
};
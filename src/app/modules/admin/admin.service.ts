import { deleteSingleFileFromS3 } from "../../utils/deletes3Image";
import { TAdmin } from "./admin.interface";
import Admin from "./admin.model";

const getAdminProfile = async (email: string) => {
  const admin = await Admin.findOne({ email }).select("email name image phone");
  return admin;
};

const updateAdmin = async (email: string, payload: Partial<TAdmin>) => {
  console.log('payload', payload);
  const result = await Admin.findOneAndUpdate({ email }, payload, { new: true });
  return result;
};

const updateAdminImage = async (email: string, image: Partial<TAdmin>) => {
  const admin = await Admin.findOne({ email });
  const result = await Admin.findOneAndUpdate({ email }, { image }, { new: true });
  if (result) {
    if (admin?.image && !admin?.image.includes("postimg")) deleteSingleFileFromS3(admin?.image.split(".com/")[1]);
  }
  return result;
};

export const adminServices = { updateAdmin, getAdminProfile, updateAdminImage };

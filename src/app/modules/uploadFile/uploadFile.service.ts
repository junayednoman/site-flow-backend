import { AppError } from "../../classes/appError";
import { deleteSingleFileFromS3 } from "../../utils/deleteSingleFileFromS3";

const uploadFile = async (file: any) => {
  if (!file) throw new AppError(400, "File is required!");
  return { url: file.location };
}

const deleteFile = async (file_url: string) => {
  await deleteSingleFileFromS3(file_url.split(".amazonaws.com/")[1]);
}
export const uploadFileService = { uploadFile, deleteFile };
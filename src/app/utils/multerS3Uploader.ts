import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import config from "../config";

// Configure AWS S3 Client
const s3 = new S3Client({
  credentials: {
    accessKeyId: config.aws_access_key_id as string,
    secretAccessKey: config.aws_secret_access_key as string,
  },
  region: config.aws_region as string,
});

// Multer configuration with multer-s3
export const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: config.aws_s3_bucket_name as string, // Your bucket name
    // Remove the 'acl' property to avoid the error
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const fileName = `${Date.now()}-${file.originalname}`; // Unique file name
      cb(null, fileName);
    },
  }),

  fileFilter: (req, file, cb) => {
    // Allowed file types for images and videos
    const allowedMimeTypes = [
      "image/jpeg", "image/png", "image/gif", "image/jpg", "image/webp", // Image types
      "video/mp4", "video/webm", "video/avi", "video/mkv", "video/mov",  // Video types
      "application/pdf",                                              // Documents (PDF)
      "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // Word (.doc, .docx)
      "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // Excel (.xls, .xlsx)
      "image/vnd.dwg",                                                // AutoCAD Drawing (.dwg)
      "application/dxf",                                              // Drawing Exchange Format (.dxf)
      "application/ifc"                                               // Industry Foundation Classes (.ifc)
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      cb(new Error("Only image and video files are allowed!"), false);
    }
  },
  limits: {
    fileSize: 200 * 1024 * 1024, // 200 MB limit
  },
});
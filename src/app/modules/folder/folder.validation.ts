import { z } from 'zod';

export const createFolderValidationSchema = z.object({
  name: z.string().min(1, "Folder name is required"),
  project: z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), "Invalid project ID"),
});

export const updateFolderNameValidationSchema = z.object({
  name: z.string().min(1, "Folder name is required"),
});

export const addFileValidationSchema = z.object({
  name: z.string().min(1, "File name is required"),
});

export const removeFileValidationSchema = z.object({
  url: z.string().min(1, "URL is required"),
});
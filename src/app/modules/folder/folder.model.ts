import mongoose from 'mongoose';
import { TFolder, TFile } from './folder.interface';

const FileSchema = new mongoose.Schema<TFile>({
  name: { type: String, required: true, unique: true },
  url: { type: String, required: true },
});

const FolderSchema = new mongoose.Schema<TFolder>({
  name: { type: String, required: true, unique: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  files: [FileSchema],
  added_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', required: true },
}, {
  timestamps: true,
});

const Folder = mongoose.model('Folder', FolderSchema);

export default Folder;
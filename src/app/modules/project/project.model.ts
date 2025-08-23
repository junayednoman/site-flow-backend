import mongoose from 'mongoose';
import { TProjectType } from './project.interface';

const ProjectSchema = new mongoose.Schema<TProjectType>({
  client_name: { type: String, required: true },
  company_admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', required: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  timeline: { type: String, required: true },
  note: { type: String, required: false },
  supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', required: true },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', required: true },
}, {
  timestamps: true
});

const Project = mongoose.model('Project', ProjectSchema);

export default Project;
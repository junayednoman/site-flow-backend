import { ObjectId, startSession } from 'mongoose';
import ExcavationReport from './excavationReport.model';
import { AppError } from '../../classes/appError';
import { TExcavationReport } from './excavationReport.interface';
import Project from '../project/project.model';
import checkProjectAuthorization from '../../utils/checkProjectAuthorization';
import { userRoles } from '../../constants/global.constant';
import { TFile } from '../../interface/file.interface';
import { deleteFromS3, uploadToS3 } from '../../utils/awss3';

const addOrReplaceExcavationReport = async (userId: ObjectId, payload: TExcavationReport, files?: { client_approved_signature?: TFile[]; signed_on_completion_signature?: TFile[] }) => {
  const session = await startSession();
  session.startTransaction();

  try {
    const project = await Project.findById(payload.project).session(session);
    if (!project) {
      throw new AppError(400, "Invalid project ID!");
    }

    // Handle file uploads
    if (files?.client_approved_signature?.length) {
      payload.client_approved_signature = await uploadToS3(files.client_approved_signature[0]);
    }
    if (files?.signed_on_completion_signature?.length) {
      payload.signed_on_completion_signature = await uploadToS3(files.signed_on_completion_signature[0]);
    }

    // Check if a report already exists for this project
    const existingReport = await ExcavationReport.findOne({ project: payload.project }).session(session);
    if (existingReport) {
      // Replace existing report
      payload.updated_by = userId;
      Object.assign(existingReport, payload);
      await existingReport.save({ session });
      await session.commitTransaction();
      return existingReport;
    } else {
      // Create new report
      payload.updated_by = userId;
      const report = await ExcavationReport.create([payload], { session });
      await session.commitTransaction();
      return report[0];
    }
  } catch (error: any) {
    await session.abortTransaction();
    if (payload.signed_on_completion_signature) await deleteFromS3(payload.signed_on_completion_signature);
    if (payload.client_approved_signature) await deleteFromS3(payload.client_approved_signature);
    throw new AppError(500, error.message || "Error processing excavation report!");
  } finally {
    session.endSession();
  }
};

const getProjectExcavationReport = async (projectId: string, userId: string) => {
  const project = await Project.findById(projectId);
  if (!project) throw new AppError(400, "Invalid project ID!");

  // Use checkProjectAuthorization with updated roles
  checkProjectAuthorization(project, userId, [userRoles.companyAdmin, userRoles.employee]);

  const report = await ExcavationReport.findOne({ project: projectId });

  return report;
};

const removeSignature = async (projectId: string, userId: ObjectId, payload: { signatureType: string }) => {
  const project = await Project.findById(projectId);
  if (!project) throw new AppError(400, "Invalid project ID!");

  // Use checkProjectAuthorization with updated roles
  checkProjectAuthorization(project, userId.toString(), [userRoles.companyAdmin, userRoles.employee]);

  const report = await ExcavationReport.findOne({ project: projectId });
  if (!report) throw new AppError(404, "No excavation report found for this project!");

  if (payload.signatureType === "client_approved_signature" && report.client_approved_signature) {
    await deleteFromS3(report.client_approved_signature);
    report.client_approved_signature = undefined;
    report.updated_by = userId;
  } else if (payload.signatureType === "signed_on_completion_signature" && report.signed_on_completion_signature) {
    await deleteFromS3(report.signed_on_completion_signature);
    report.signed_on_completion_signature = undefined;
    report.updated_by = userId;
  } else {
    throw new AppError(400, "Signature does not exist or invalid signature type!");
  }

  await report.save();
  return report;
};

export default { addOrReplaceExcavationReport, getProjectExcavationReport, removeSignature };
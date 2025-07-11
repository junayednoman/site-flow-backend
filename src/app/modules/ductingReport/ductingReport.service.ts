import { ObjectId, startSession } from 'mongoose';
import DuctingReport from './ductingReport.model';
import { AppError } from '../../classes/appError';
import { TDuctingReport } from './ductingReport.interface';
import Project from '../project/project.model'
import checkProjectAuthorization from '../../utils/checkProjectAuthorization';
import { userRoles } from '../../constants/global.constant';
import { deleteSingleFileFromS3 } from '../../utils/deleteSingleFileFromS3';

const addOrReplaceDuctingReport = async (userId: ObjectId, payload: TDuctingReport, files?: { client_approved_signature?: any; signed_on_completion_signature?: any }) => {
  const session = await startSession();
  session.startTransaction();

  try {
    const project = await Project.findById(payload.project).session(session);
    if (!project) {
      await deleteSingleFileFromS3(files?.client_approved_signature[0]?.key);
      await deleteSingleFileFromS3(files?.signed_on_completion_signature[0]?.key);
      throw new AppError(400, "Invalid project ID!");
    }

    // Handle file uploads
    if (files?.client_approved_signature) {
      payload.client_approved_signature = files.client_approved_signature[0].location;
    }
    if (files?.signed_on_completion_signature) {
      payload.signed_on_completion_signature = files.signed_on_completion_signature[0].location;
    }

    // Check if a report already exists for this project
    const existingReport = await DuctingReport.findOne({ project: payload.project }).session(session);
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
      const report = await DuctingReport.create([payload], { session });
      await session.commitTransaction();
      return report[0];
    }
  } catch (error: any) {
    await session.abortTransaction();
    await deleteSingleFileFromS3(files?.client_approved_signature[0]?.key);
    await deleteSingleFileFromS3(files?.signed_on_completion_signature[0]?.key);
    throw new AppError(500, error.message || "Error processing ducting report!");
  } finally {
    session.endSession();
  }
};

const getProjectDuctingReport = async (projectId: string, userId: string) => {
  const project = await Project.findById(projectId);
  if (!project) throw new AppError(400, "Invalid project ID!");

  // Use checkProjectAuthorization with updated roles
  checkProjectAuthorization(project, userId, [userRoles.companyAdmin, userRoles.employee]);

  const report = await DuctingReport.findOne({ project: projectId });

  return report;
};

const removeSignature = async (projectId: string, userId: ObjectId, payload: { signatureType: string }) => {
  const project = await Project.findById(projectId);
  if (!project) throw new AppError(400, "Invalid project ID!");

  // Use checkProjectAuthorization with updated roles
  checkProjectAuthorization(project, userId.toString(), [userRoles.companyAdmin, userRoles.employee]);

  const report = await DuctingReport.findOne({ project: projectId });
  if (!report) throw new AppError(404, "No ducting report found for this project!");

  if (payload.signatureType === "client_approved_signature") {
    await deleteSingleFileFromS3(report.client_approved_signature!.split('.amazonaws.com/')[1]);
    report.client_approved_signature = undefined;
    report.updated_by = userId;
  } else if (payload.signatureType === "signed_on_completion_signature") {
    await deleteSingleFileFromS3(report.signed_on_completion_signature!.split('.amazonaws.com/')[1]);
    report.signed_on_completion_signature = undefined;
    report.updated_by = userId;
  } else {
    throw new AppError(400, "Invalid signature type!");
  }

  await report.save();
  return report;
};

export default { addOrReplaceDuctingReport, getProjectDuctingReport, removeSignature };
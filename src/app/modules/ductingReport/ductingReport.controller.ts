import { TFile } from "../../interface/file.interface";
import handleAsyncRequest from "../../utils/handleAsyncRequest";
import { successResponse } from "../../utils/successResponse";
import ductingReportService from "./ductingReport.service";

const addOrReplaceDuctingReport = handleAsyncRequest(async (req: any, res) => {
  const id = req.user.id;
  const payload = JSON.parse(req.body.payload || "{}");
  const files = req.files as { client_approved_signature?: TFile[]; signed_on_completion_signature?: TFile[] };
  const result = await ductingReportService.addOrReplaceDuctingReport(id, payload, files);
  successResponse(res, {
    message: "Ducting updated successfully!",
    data: result,
  });
});

const getProjectDuctingReport = handleAsyncRequest(async (req: any, res) => {
  const { projectId } = req.params;
  const id = req.user.id;
  const result = await ductingReportService.getProjectDuctingReport(projectId, id);
  successResponse(res, {
    message: "Ducting report retrieved successfully!",
    data: result,
  });
});

const removeSignature = handleAsyncRequest(async (req: any, res) => {
  const { projectId } = req.params;
  const id = req.user.id;
  const { signatureType } = req.body;
  const result = await ductingReportService.removeSignature(projectId, id, { signatureType });
  successResponse(res, {
    message: "Signature removed successfully!",
    data: result,
  });
});

const ductingReportController = {
  addOrReplaceDuctingReport,
  getProjectDuctingReport,
  removeSignature,
};
export default ductingReportController;
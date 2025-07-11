import handleAsyncRequest from "../../utils/handleAsyncRequest";
import { successResponse } from "../../utils/successResponse";
import postPourInspectionReportService from "./postPourInspectionReport.service";

const addOrReplacePostPourInspectionReport = handleAsyncRequest(async (req: any, res) => {
  const id = req.user.id;
  const payload = JSON.parse(req.body.payload || "{}");
  const files = req.files as { client_approved_signature?: any; signed_on_completion_signature?: any };
  const result = await postPourInspectionReportService.addOrReplacePostPourInspectionReport(id, payload, files);
  successResponse(res, {
    message: "Post pour inspection report updated successfully!",
    data: result,
  });
});

const getProjectPostPourInspectionReport = handleAsyncRequest(async (req: any, res) => {
  const { projectId } = req.params;
  const id = req.user.id;
  const result = await postPourInspectionReportService.getProjectPostPourInspectionReport(projectId, id);
  successResponse(res, {
    message: "Post pour inspection report retrieved successfully!",
    data: result,
  });
});

const removeSignatureFromPostPourInspectionReport = handleAsyncRequest(async (req: any, res) => {
  const { projectId } = req.params;
  const id = req.user.id;
  const { signatureType } = req.body;
  const result = await postPourInspectionReportService.removeSignatureFromPostPourInspectionReport(projectId, id, { signatureType });
  successResponse(res, {
    message: "Signature removed successfully!",
    data: result,
  });
});

const postPourInspectionReportController = {
  addOrReplacePostPourInspectionReport,
  getProjectPostPourInspectionReport,
  removeSignatureFromPostPourInspectionReport,
};
export default postPourInspectionReportController;
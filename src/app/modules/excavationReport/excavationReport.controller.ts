import handleAsyncRequest from "../../utils/handleAsyncRequest";
import { successResponse } from "../../utils/successResponse";
import excavationReportService from "./excavationReport.service";

const addOrReplaceExcavationReport = handleAsyncRequest(async (req: any, res) => {
  const id = req.user.id;
  const payload = JSON.parse(req.body.payload || "{}");
  const files = req.files as { client_approved_signature?: any; signed_on_completion_signature?: any };
  const result = await excavationReportService.addOrReplaceExcavationReport(id, payload, files);
  successResponse(res, {
    message: "Excavation report updated successfully!",
    data: result,
  });
});

const getProjectExcavationReport = handleAsyncRequest(async (req: any, res) => {
  const { projectId } = req.params;
  const id = req.user.id;
  const result = await excavationReportService.getProjectExcavationReport(projectId, id);
  successResponse(res, {
    message: "Excavation report retrieved successfully!",
    data: result,
  });
});

const removeSignature = handleAsyncRequest(async (req: any, res) => {
  const { projectId } = req.params;
  const id = req.user.id;
  const { signatureType } = req.body;
  const result = await excavationReportService.removeSignature(projectId, id, { signatureType });
  successResponse(res, {
    message: "Signature removed successfully!",
    data: result,
  });
});

const excavationReportController = {
  addOrReplaceExcavationReport,
  getProjectExcavationReport,
  removeSignature,
};
export default excavationReportController;
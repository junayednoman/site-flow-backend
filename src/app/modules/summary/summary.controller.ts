import handleAsyncRequest from "../../utils/handleAsyncRequest";
import { successResponse } from "../../utils/successResponse";
import summaryService from "./summary.service";

const getDashboardStats = handleAsyncRequest(async (req: any, res) => {
  const result = await summaryService.getDashboardStats();
  successResponse(res, {
    message: "Dashboard summary retrieved successfully!",
    data: result,
  });
});

const getPaymentSummary = handleAsyncRequest(async (req: any, res) => {
  const year = req.query.year
  const result = await summaryService.getPaymentSummary(year);
  successResponse(res, {
    message: "Payment summary retrieved successfully!",
    data: result,
  });
});

export const summaryController = {
  getDashboardStats,
  getPaymentSummary
};
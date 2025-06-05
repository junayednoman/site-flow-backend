import handleAsyncRequest from "../../utils/handleAsyncRequest";
import { successResponse } from "../../utils/successResponse";
import dayWorkService from "./dayWork.service";

const createDayWork = handleAsyncRequest(async (req: any, res) => {
  const payload = JSON.parse(req.body.payload || "{}");
  const file = req.file;
  const userId = req.user.id;
  const result = await dayWorkService.createDayWork(userId, payload, file);
  successResponse(res, {
    message: "Day-work created successfully!",
    data: result,
    status: 201,
  });
});

const getDayWorkById = handleAsyncRequest(async (req, res) => {
  const id = req.params.id;
  const result = await dayWorkService.getDayWorkById(id);
  successResponse(res, {
    message: "Day-work retrieved successfully!",
    data: result,
  });
});

const getProjectDayWorks = handleAsyncRequest(async (req, res) => {
  const query = req.query;
  const projectId = req.params.projectId;
  const result = await dayWorkService.getProjectDayWorks(query, projectId);
  successResponse(res, {
    message: "Day-works retrieved successfully!",
    data: result,
  });
});

const updateDayWork = handleAsyncRequest(async (req: any, res) => {
  const id = req.params.id;
  const userId = req.user.id;
  const payload = JSON.parse(req.body.payload || "{}");
  const file = req.file;
  const result = await dayWorkService.updateDayWork(id, userId, payload, file);
  successResponse(res, {
    message: "Day-work updated successfully!",
    data: result,
  });
});

const deleteDayWork = handleAsyncRequest(async (req, res) => {
  const id = req.params.id;
  const result = await dayWorkService.deleteDayWork(id);
  successResponse(res, {
    message: "Day-work deleted successfully!",
    data: result,
  });
});

export default {
  createDayWork,
  getDayWorkById,
  getProjectDayWorks,
  updateDayWork,
  deleteDayWork,
};

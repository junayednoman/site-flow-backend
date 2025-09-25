import handleAsyncRequest from "../../utils/handleAsyncRequest";
import { successResponse } from "../../utils/successResponse";
import dayWorkService from "./dayWork.service";

const createDayWork = handleAsyncRequest(async (req: any, res) => {
  const payload = JSON.parse(req.body.payload || "{}");
  const userId = req.user.id;
  const result = await dayWorkService.createDayWork(userId, payload, req.file);
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

const getProjectDayWorks = handleAsyncRequest(async (req: any, res) => {
  const query = req.query;
  const projectId = req.params.projectId;
  const userId = req.user.id;
  const result = await dayWorkService.getProjectDayWorks(query, projectId, userId);
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

const addDelay = handleAsyncRequest(async (req: any, res) => {
  const dayWorkId = req.params.id;
  const userId = req.user.id;
  const delay = req.body.delay;
  const result = await dayWorkService.addDelay(dayWorkId, userId, delay);
  successResponse(res, {
    message: "Delay reason added successfully!",
    data: result,
  });
});

const addComment = handleAsyncRequest(async (req: any, res) => {
  const dayWorkId = req.params.id;
  const userId = req.user.id;
  const comment = req.body.comment;
  const result = await dayWorkService.addComment(dayWorkId, userId, comment);
  successResponse(res, {
    message: "Comment added successfully!",
    data: result,
  });
});

const addTask = handleAsyncRequest(async (req: any, res) => {
  const dayWorkId = req.params.id;
  const task = req.body;
  const result = await dayWorkService.addTask(dayWorkId, task);
  successResponse(res, {
    message: "Task added successfully!",
    data: result,
    status: 201,
  });
});

const removeTask = handleAsyncRequest(async (req: any, res) => {
  const dayWorkId = req.params.id;
  const taskIndex = parseInt(req.body.task_index);
  const result = await dayWorkService.removeTask(dayWorkId, taskIndex);
  successResponse(res, {
    message: "Task removed successfully!",
    data: result,
  });
});

const removeDayWorkWorkforce = handleAsyncRequest(async (req: any, res) => {
  const dayWorkId = req.params.id;
  const workforceId = req.body.workforce_id;
  const taskIndex = parseInt(req.body.task_index);
  const result = await dayWorkService.removeDayWorkWorkforce(dayWorkId, workforceId, taskIndex);
  successResponse(res, {
    message: "Workforce removed from day-work successfully!",
    data: result,
  });
});

const removeDayWorkEquipment = handleAsyncRequest(async (req: any, res) => {
  const dayWorkId = req.params.id;
  const equipmentId = req.body.equipment_id;
  const taskIndex = parseInt(req.body.task_index);
  const result = await dayWorkService.removeDayWorkEquipment(dayWorkId, equipmentId, taskIndex);
  successResponse(res, {
    message: "Equipment removed from day-work successfully!",
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
  addDelay,
  addComment,
  addTask,
  removeTask,
  removeDayWorkWorkforce,
  removeDayWorkEquipment,
  deleteDayWork,
};
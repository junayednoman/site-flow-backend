import handleAsyncRequest from "../../utils/handleAsyncRequest";
import { successResponse } from "../../utils/successResponse";
import siteDiaryService from "./siteDiary.service";

const createSiteDiary = handleAsyncRequest(async (req: any, res) => {
  const file = req.file;
  const payload = JSON.parse(req.body.payload || "{}");
  const userId = req.user.id;
  const result = await siteDiaryService.createSiteDiary(userId, payload, file);
  successResponse(res, {
    message: "Site-diary created successfully!",
    data: result,
    status: 201,
  });
});

const getSiteDiaryById = handleAsyncRequest(async (req, res) => {
  const id = req.params.id;
  const result = await siteDiaryService.getSiteDiaryById(id);
  successResponse(res, {
    message: "Site-diary retrieved successfully!",
    data: result,
  });
});

const getProjectSiteDiaries = handleAsyncRequest(async (req: any, res) => {
  const query = req.query;
  const projectId = req.params.projectId;
  const userId = req.user.id;
  const result = await siteDiaryService.getProjectSiteDiaries(query, projectId, userId);
  successResponse(res, {
    message: "Site-diaries retrieved successfully!",
    data: result,
  });
});

const updateSiteDiary = handleAsyncRequest(async (req: any, res) => {
  const id = req.params.id;
  const userId = req.user.id;
  const payload = JSON.parse(req.body.payload || "{}");
  const file = req.file;
  const result = await siteDiaryService.updateSiteDiary(id, userId, payload, file);
  successResponse(res, {
    message: "Site-diary updated successfully!",
    data: result,
  });
});

const addDelay = handleAsyncRequest(async (req: any, res) => {
  const siteDiaryId = req.params.id;
  const userId = req.user.id;
  const delay = req.body.delay;
  const result = await siteDiaryService.addDelay(siteDiaryId, userId, delay);
  successResponse(res, {
    message: "Delay reason added successfully!",
    data: result,
  });
});

const addComment = handleAsyncRequest(async (req: any, res) => {
  const siteDiaryId = req.params.id;
  const userId = req.user.id;
  const comment = req.body.comment;
  const result = await siteDiaryService.addComment(siteDiaryId, userId, comment);
  successResponse(res, {
    message: "Comment added successfully!",
    data: result,
  });
});

const addTask = handleAsyncRequest(async (req: any, res) => {
  const siteDiaryId = req.params.id;
  const task = req.body;
  const result = await siteDiaryService.addTask(siteDiaryId, task);
  successResponse(res, {
    message: "Task added successfully!",
    data: result,
    status: 201,
  });
});

const removeTask = handleAsyncRequest(async (req: any, res) => {
  const siteDiaryId = req.params.id;
  const taskIndex = parseInt(req.body.task_index);
  const result = await siteDiaryService.removeTask(siteDiaryId, taskIndex);
  successResponse(res, {
    message: "Task removed successfully!",
    data: result,
  });
});

const removeSiteDiaryWorkforce = handleAsyncRequest(async (req: any, res) => {
  const siteDiaryId = req.params.id;
  const workforceId = req.body.workforce_id;
  const taskIndex = parseInt(req.body.task_index);
  const result = await siteDiaryService.removeSiteDiaryWorkforce(siteDiaryId, workforceId, taskIndex);
  successResponse(res, {
    message: "Workforce removed from site-diary successfully!",
    data: result,
  });
});

const removeSiteDiaryEquipment = handleAsyncRequest(async (req: any, res) => {
  const siteDiaryId = req.params.id;
  const equipmentId = req.body.equipment_id;
  const taskIndex = parseInt(req.body.task_index);
  const result = await siteDiaryService.removeSiteDiaryEquipment(siteDiaryId, equipmentId, taskIndex);
  successResponse(res, {
    message: "Equipment removed from site-diary successfully!",
    data: result,
  });
});

const deleteSiteDiary = handleAsyncRequest(async (req, res) => {
  const id = req.params.id;
  const result = await siteDiaryService.deleteSiteDiary(id);
  successResponse(res, {
    message: "Site-diary deleted successfully!",
    data: result,
  });
});

export default {
  createSiteDiary,
  getSiteDiaryById,
  getProjectSiteDiaries,
  updateSiteDiary,
  addDelay,
  addComment,
  addTask,
  removeTask,
  removeSiteDiaryWorkforce,
  removeSiteDiaryEquipment,
  deleteSiteDiary,
};
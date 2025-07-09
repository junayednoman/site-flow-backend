import handleAsyncRequest from "../../utils/handleAsyncRequest";
import { successResponse } from "../../utils/successResponse";
import planService from "./plan.service";

const createPlan = handleAsyncRequest(async (req: any, res) => {
  const payload = req.body;
  const userId = req.user.id;
  const result = await planService.createPlan(userId, payload);
  successResponse(res, {
    message: "Plan created successfully!",
    data: result,
    status: 201,
  });
});

const getPlanById = handleAsyncRequest(async (req: any, res) => {
  const id = req.params.id;
  const userId = req.user.id;
  const result = await planService.getPlanById(id, userId);
  successResponse(res, {
    message: "Plan retrieved successfully!",
    data: result,
  });
});

const getProjectPlans = handleAsyncRequest(async (req: any, res) => {
  const query = req.query;
  const projectId = req.params.projectId;
  const userId = req.user.id;
  const result = await planService.getProjectPlans(query, projectId, userId);
  successResponse(res, {
    message: "Plans retrieved successfully!",
    data: result,
  });
});

const updatePlan = handleAsyncRequest(async (req: any, res) => {
  const id = req.params.id;
  const userId = req.user.id;
  const payload = req.body;
  const result = await planService.updatePlan(id, userId, payload);
  successResponse(res, {
    message: "Plan updated successfully!",
    data: result,
  });
});

const deletePlan = handleAsyncRequest(async (req, res) => {
  const id = req.params.id;
  const result = await planService.deletePlan(id);
  successResponse(res, {
    message: "Plan deleted successfully!",
    data: result,
  });
});

const removePlanWorkforce = handleAsyncRequest(async (req: any, res) => {
  const planId = req.params.id;
  const workforceId = req.body.workforce_id;
  const taskIndex = req.body.task_index
  const result = await planService.removePlanWorkforce(planId, workforceId, taskIndex);
  successResponse(res, {
    message: "Workforce removed from plan successfully!",
    data: result,
  });
});

const removePlanEquipment = handleAsyncRequest(async (req: any, res) => {
  const planId = req.params.id;
  const equipmentId = req.body.equipment_id;
  const taskIndex = parseInt(req.body.task_index, 10) || 0;
  const result = await planService.removePlanEquipment(planId, equipmentId, taskIndex);
  successResponse(res, {
    message: "Equipment removed from plan successfully!",
    data: result,
  });
});

const addTask = handleAsyncRequest(async (req: any, res) => {
  const planId = req.params.id;
  const task = req.body;
  const result = await planService.addTask(planId, task);
  successResponse(res, {
    message: "Task added to plan successfully!",
    data: result,
  });
});

const removeTask = handleAsyncRequest(async (req: any, res) => {
  const planId = req.params.id;
  const taskIndex = req.body.index;
  const result = await planService.removeTask(planId, taskIndex);
  successResponse(res, {
    message: "Task removed from plan successfully!",
    data: result,
  });
});

export default {
  createPlan,
  getPlanById,
  getProjectPlans,
  updatePlan,
  deletePlan,
  removePlanWorkforce,
  removePlanEquipment,
  addTask,
  removeTask
};
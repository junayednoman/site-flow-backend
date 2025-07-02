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

const getProjectsAllPlans = handleAsyncRequest(async (req: any, res) => {
  const query = req.query;
  const userId = req.user.id;
  const projectId = req.params.projectId;
  const result = await planService.getProjectsAllPlans(query, userId,  projectId);
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

const removeWorkforceFromPlan = handleAsyncRequest(async (req: any, res) => {
  const planId = req.params.id;
  const workforceId = req.body.workforceId;
  const userId = req.user.id;
  const result = await planService.removeWorkforceFromPlan(planId, workforceId, userId);
  successResponse(res, {
    message: "Workforce removed from plan successfully!",
    data: result,
  });
});

const deletePlan = handleAsyncRequest(async (req: any, res) => {
  const id = req.params.id;
  const userId = req.user.id;
  const result = await planService.deletePlan(id, userId);
  successResponse(res, {
    message: "Plan deleted successfully!",
    data: result,
  });
});

export default {
  createPlan,
  getPlanById,
  getProjectsAllPlans,
  updatePlan,
  deletePlan,
};
import handleAsyncRequest from "../../utils/handleAsyncRequest";
import { successResponse } from "../../utils/successResponse";
import workforceService from "./workforce.service";

const createWorkforce = handleAsyncRequest(async (req, res) => {
  const payload = req.body;
  const result = await workforceService.createWorkforce(payload);
  successResponse(res, {
    message: "Workforce created successfully!",
    data: result,
    status: 201,
  });
});

const getWorkforceById = handleAsyncRequest(async (req, res) => {
  const id = req.params.id;
  const result = await workforceService.getWorkforceById(id);
  successResponse(res, {
    message: "Workforce retrieved successfully!",
    data: result,
  });
});

const getProjectWorkforces = handleAsyncRequest(async (req, res) => {
  const projectId = req.params.projectId;
  const result = await workforceService.getProjectWorkforces(projectId);
  successResponse(res, {
    message: "Workforces retrieved successfully!",
    data: result,
  });
});

const updateWorkforce = handleAsyncRequest(async (req: any, res) => {
  const id = req.params.id;
  const payload = req.body;
  const userId = req.user.id;
  const result = await workforceService.updateWorkforce(id, payload, userId);
  successResponse(res, {
    message: "Workforce updated successfully!",
    data: result,
  });
});

const deleteWorkforce = handleAsyncRequest(async (req: any, res) => {
  const id = req.params.id;
  const userId = req.user.id;
  const result = await workforceService.deleteWorkforce(id, userId);
  successResponse(res, {
    message: "Workforce deleted successfully!",
    data: result,
  });
});

export default {
  createWorkforce,
  getWorkforceById,
  getProjectWorkforces,
  updateWorkforce,
  deleteWorkforce,
};

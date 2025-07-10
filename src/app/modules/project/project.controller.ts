import handleAsyncRequest from "../../utils/handleAsyncRequest";
import { successResponse } from "../../utils/successResponse";
import projectService from "./project.service";

const createProject = handleAsyncRequest(async (req: any, res) => {
  const id = req.user.id;
  const payload = req.body;
  const result = await projectService.createProject(id, payload);
  successResponse(res, {
    message: "Project created successfully!",
    data: result,
    status: 201
  });
});

const getMyProjects = handleAsyncRequest(async (req: any, res) => {
  const query = req.query;
  const userRole = req.user.role;
  const userId = req.user.id;
  const result = await projectService.getMyProjects(query, userRole, userId);
  successResponse(res, {
    message: "Projects retrieved successfully!",
    data: result
  });
});

const getSingleProject = handleAsyncRequest(async (req: any, res) => {
  const id = req.params.id;
  const userRole = req.user.role;
  const userId = req.user.id;
  const result = await projectService.getSingleProject(id, userRole, userId);
  successResponse(res, {
    message: "Project retrieved successfully!",
    data: result
  });
});

const updateProject = handleAsyncRequest(async (req: any, res) => {
  const id = req.params.id;
  const userId = req.user.id;
  const payload = req.body;
  const result = await projectService.updateProject(id, userId, payload);
  successResponse(res, {
    message: "Project updated successfully!",
    data: result
  });
});


const projectController = { createProject, getMyProjects, getSingleProject, updateProject };
export default projectController;
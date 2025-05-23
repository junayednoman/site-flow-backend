import { Router } from "express";
import { userRoles } from "../../constants/global.constant";
import authVerify from "../../middlewares/authVerify";
import { handleZodValidation } from "../../middlewares/handleZodValidation";
import { ProjectValidationSchema } from "./project.validation";
import projectController from "./project.controller";

const projectRoutes = Router();

projectRoutes.post("/", authVerify([userRoles.companyAdmin]), handleZodValidation(ProjectValidationSchema), projectController.createProject);
projectRoutes.get("/", authVerify([userRoles.companyAdmin, userRoles.employee]), projectController.getAllProjects);
projectRoutes.get("/:id", projectController.getSingleProject);
projectRoutes.put("/:id", authVerify([userRoles.companyAdmin]), handleZodValidation(ProjectValidationSchema), projectController.updateProject);
projectRoutes.delete("/:id", authVerify([userRoles.companyAdmin]), projectController.deleteProject);

export default projectRoutes;
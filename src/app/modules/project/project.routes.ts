import { Router } from "express";
import { userRoles } from "../../constants/global.constant";
import authVerify from "../../middlewares/authVerify";
import { handleZodValidation } from "../../middlewares/handleZodValidation";
import { ProjectValidationSchema, UpdateProjectValidationSchema } from "./project.validation";
import projectController from "./project.controller";

const projectRoutes = Router();

projectRoutes.post("/", authVerify([userRoles.companyAdmin]), handleZodValidation(ProjectValidationSchema), projectController.createProject);
projectRoutes.get("/", authVerify([userRoles.companyAdmin, userRoles.employee]), projectController.getCompanyProjects);
projectRoutes.get("/:id", authVerify([userRoles.companyAdmin, userRoles.employee]), projectController.getSingleProject);
projectRoutes.put("/:id", authVerify([userRoles.companyAdmin]), handleZodValidation(UpdateProjectValidationSchema), projectController.updateProject);
projectRoutes.delete("/:id", authVerify([userRoles.companyAdmin]), projectController.deleteProject);

export default projectRoutes;
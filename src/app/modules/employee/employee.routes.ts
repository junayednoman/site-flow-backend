import { Router } from "express";
import authVerify from "../../middlewares/authVerify";
import { userRoles } from "../../constants/global.constant";
import { handleZodValidation } from "../../middlewares/handleZodValidation";
import { employeeValidationSchema, updateEmployeeValidationSchema } from "./employee.validation";
import employeeController from "./employee.controller";

const employeeRouters = Router();

employeeRouters.post("/", authVerify([userRoles.companyAdmin]), handleZodValidation(employeeValidationSchema), employeeController.createEmployee);
employeeRouters.get("/", authVerify([userRoles.companyAdmin]), employeeController.getAllCompanyEmployees);
employeeRouters.get("/profile", authVerify([userRoles.employee]), employeeController.getEmployeeProfile);
employeeRouters.get("/:id", authVerify([userRoles.companyAdmin, userRoles.admin, userRoles.employee]), employeeController.getSingleEmployee);
employeeRouters.put("/", authVerify([userRoles.employee]), handleZodValidation(updateEmployeeValidationSchema), employeeController.updateEmployeeProfile);
employeeRouters.delete("/:id", authVerify([userRoles.companyAdmin]), employeeController.deleteEmployee);

export default employeeRouters;
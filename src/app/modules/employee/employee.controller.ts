import handleAsyncRequest from "../../utils/handleAsyncRequest";
import { successResponse } from "../../utils/successResponse";
import employeeService from "./employee.service";

const createEmployee = handleAsyncRequest(async (req: any, res) => {
  const userId = req.user.id
  const payload = req.body;
  const result = await employeeService.createEmployee(userId, payload);
  successResponse(res, {
    message: "Employee created successfully!",
    data: result,
    status: 201
  });
});

const getAllCompanyEmployees = handleAsyncRequest(async (req: any, res) => {
  const userId = req.user.id
  const result = await employeeService.getAllCompanyEmployees(userId);
  successResponse(res, {
    message: "Employees retrieved successfully!",
    data: result
  });
});

const getSingleEmployee = handleAsyncRequest(async (req: any, res) => {
  const id = req.params.id;
  const result = await employeeService.getSingleEmployee(id);
  successResponse(res, {
    message: "Employee retrieved successfully!",
    data: result
  });
});

const getEmployeeProfile = handleAsyncRequest(async (req: any, res) => {
  const email = req.user.email;
  const result = await employeeService.getEmployeeProfile(email);
  successResponse(res, {
    message: "Employee profile retrieved successfully!",
    data: result
  });
});

const updateEmployeeProfile = handleAsyncRequest(async (req: any, res) => {
  const email = req.user.email;
  const payload = req.body;
  const result = await employeeService.updateEmployeeProfile(email, payload);
  successResponse(res, {
    message: "Employee profile updated successfully!",
    data: result
  });
});

const deleteEmployee = handleAsyncRequest(async (req: any, res) => {
  const id = req.params.id
  const result = await employeeService.deleteEmployee(id);
  successResponse(res, {
    message: "Employee deleted successfully!",
    data: result
  });
});

const employeeController = { createEmployee, getAllCompanyEmployees, getSingleEmployee, getEmployeeProfile, updateEmployeeProfile, deleteEmployee };

export default employeeController;
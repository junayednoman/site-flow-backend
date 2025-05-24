import handleAsyncRequest from "../../utils/handleAsyncRequest";
import { successResponse } from "../../utils/successResponse";
import equipmentService from "./equipment.service";

const createEquipment = handleAsyncRequest(async (req, res) => {
  const payload = req.body;
  const result = await equipmentService.createEquipment(payload);
  successResponse(res, {
    message: "Equipment created successfully!",
    data: result,
    status: 201,
  });
});

const getEquipmentById = handleAsyncRequest(async (req, res) => {
  const id = req.params.id;
  const result = await equipmentService.getEquipmentById(id);
  successResponse(res, {
    message: "Equipment retrieved successfully!",
    data: result,
  });
});

const getAllEquipments = handleAsyncRequest(async (req, res) => {
  const projectId = req.params.projectId;
  const result = await equipmentService.getAllEquipments(projectId);
  successResponse(res, {
    message: "Equipments retrieved successfully!",
    data: result,
  });
});

const updateEquipment = handleAsyncRequest(async (req: any, res) => {
  const id = req.params.id;
  const payload = req.body;
  const userId = req.user.id;
  const result = await equipmentService.updateEquipment(id, payload, userId);
  successResponse(res, {
    message: "Equipment updated successfully!",
    data: result,
  });
});

const deleteEquipment = handleAsyncRequest(async (req: any, res) => {
  const id = req.params.id;
  const userId = req.user.id;
  const result = await equipmentService.deleteEquipment(id, userId);
  successResponse(res, {
    message: "Equipment deleted successfully!",
    data: result,
  });
});

export default {
  createEquipment,
  getEquipmentById,
  getAllEquipments,
  updateEquipment,
  deleteEquipment,
};

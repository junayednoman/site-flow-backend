import { Router } from "express";
import authVerify from "../../middlewares/authVerify";
import { userRoles } from "../../constants/global.constant";
import { handleZodValidation } from "../../middlewares/handleZodValidation";
import { equipmentValidationSchema, updateEquipmentValidationSchema } from "./equipment.validation";
import equipmentController from "./equipment.controller";

const router = Router();

router.post(
  "/",
  authVerify([userRoles.companyAdmin, userRoles.employee]),
  handleZodValidation(equipmentValidationSchema),
  equipmentController.createEquipment
);

router.get(
  "/:id",
  authVerify([userRoles.companyAdmin, userRoles.employee, userRoles.employee]),
  equipmentController.getEquipmentById
);

router.get(
  "/all/:projectId",
  authVerify([userRoles.companyAdmin, userRoles.employee, userRoles.employee]),
  equipmentController.getProjectEquipments
);

router.put(
  "/:id",
  authVerify([userRoles.companyAdmin, userRoles.employee]),
  handleZodValidation(updateEquipmentValidationSchema),
  equipmentController.updateEquipment
);

router.delete(
  "/:id",
  authVerify([userRoles.companyAdmin, userRoles.employee]),
  equipmentController.deleteEquipment
);

const equipmentRoutes = router;
export default equipmentRoutes;

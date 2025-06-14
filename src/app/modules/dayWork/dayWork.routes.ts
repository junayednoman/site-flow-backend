import { Router } from "express";
import { userRoles } from "../../constants/global.constant";
import authVerify from "../../middlewares/authVerify";
import dayWorkController from "./dayWork.controller";
import { handleZodValidation } from "../../middlewares/handleZodValidation";
import { dayWorkZodSchema, updateDayWorkZodSchema } from "./dayWork.validation";
import { upload } from "../../utils/multerS3Uploader";

const router = Router();

router.post(
  "/",
  authVerify([userRoles.employee]),
  upload.single("image"),
  handleZodValidation(dayWorkZodSchema, true),
  dayWorkController.createDayWork
);

router.get(
  "/:id",
  authVerify([userRoles.employee, userRoles.companyAdmin]),
  dayWorkController.getDayWorkById
);

router.get(
  "/project/:projectId",
  authVerify([userRoles.employee, userRoles.companyAdmin]),
  dayWorkController.getProjectDayWorks
);

router.put(
  "/:id",
  authVerify([userRoles.employee]),
  upload.single("image"),
  handleZodValidation(updateDayWorkZodSchema, true),
  dayWorkController.updateDayWork
);

router.patch(
  "/remove-workforce/:id",
  authVerify([userRoles.employee]),
  dayWorkController.removeDayWorkWorkforce
);

router.patch(
  "/remove-equipment/:id",
  authVerify([userRoles.employee]),
  dayWorkController.removeDayWorkEquipment
);

router.delete(
  "/:id",
  authVerify([userRoles.employee]),
  dayWorkController.deleteDayWork
);

const dayWorkRouters = router;

export default dayWorkRouters;

import { Router } from "express";
import { userRoles } from "../../constants/global.constant";
import authVerify from "../../middlewares/authVerify";
import dayWorkController from "./dayWork.controller";
import { handleZodValidation } from "../../middlewares/handleZodValidation";
import { commentValidation, dayWorkZodSchema, delayValidation, updateDayWorkZodSchema } from "./dayWork.validation";
import { upload } from "../../utils/multerS3Uploader";

const router = Router();

router.post(
  "/",
  authVerify([userRoles.employee, userRoles.companyAdmin]),
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
  authVerify([userRoles.employee, userRoles.companyAdmin]),
  upload.single("image"),
  handleZodValidation(updateDayWorkZodSchema, true),
  dayWorkController.updateDayWork
);

router.patch(
  "/add-delay/:id",
  authVerify([userRoles.employee]),
  handleZodValidation(delayValidation),
  dayWorkController.addDelay
);

router.patch(
  "/add-comment/:id",
  authVerify([userRoles.companyAdmin]),
  handleZodValidation(commentValidation),
  dayWorkController.addComment
);

router.post(
  "/add-task/:id",
  authVerify([userRoles.employee, userRoles.companyAdmin]),
  dayWorkController.addTask
);

router.patch(
  "/remove-task/:id",
  authVerify([userRoles.employee, userRoles.companyAdmin]),
  dayWorkController.removeTask
);

router.patch(
  "/remove-workforce/:id",
  authVerify([userRoles.employee, userRoles.companyAdmin]),
  dayWorkController.removeDayWorkWorkforce
);

router.patch(
  "/remove-equipment/:id",
  authVerify([userRoles.employee, userRoles.companyAdmin]),
  dayWorkController.removeDayWorkEquipment
);

router.delete(
  "/:id",
  authVerify([userRoles.employee, userRoles.companyAdmin]),
  dayWorkController.deleteDayWork
);

const dayWorkRouters = router;

export default dayWorkRouters;
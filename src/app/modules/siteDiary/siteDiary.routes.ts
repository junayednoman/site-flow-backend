import { Router } from "express";
import { userRoles } from "../../constants/global.constant";
import authVerify from "../../middlewares/authVerify";
import siteDiaryController from "./siteDiary.controller";
import { handleZodValidation } from "../../middlewares/handleZodValidation";
import { commentValidation, siteDiaryZodSchema, delayValidation, updateSiteDiaryZodSchema } from "./siteDiary.validation";
import { upload } from "../../utils/awss3";

const router = Router();

router.post(
  "/",
  authVerify([userRoles.employee, userRoles.companyAdmin]),
  upload.single("image"),
  handleZodValidation(siteDiaryZodSchema, true),
  siteDiaryController.createSiteDiary
);

router.get(
  "/:id",
  authVerify([userRoles.employee, userRoles.companyAdmin]),
  siteDiaryController.getSiteDiaryById
);

router.get(
  "/project/:projectId",
  authVerify([userRoles.employee, userRoles.companyAdmin]),
  siteDiaryController.getProjectSiteDiaries
);

router.put(
  "/:id",
  authVerify([userRoles.employee, userRoles.companyAdmin]),
  upload.single("image"),
  handleZodValidation(updateSiteDiaryZodSchema, true),
  siteDiaryController.updateSiteDiary
);

router.patch(
  "/add-delay/:id",
  authVerify([userRoles.employee]),
  handleZodValidation(delayValidation),
  siteDiaryController.addDelay
);

router.patch(
  "/add-comment/:id",
  authVerify([userRoles.companyAdmin]),
  handleZodValidation(commentValidation),
  siteDiaryController.addComment
);

router.post(
  "/add-task/:id",
  authVerify([userRoles.employee, userRoles.companyAdmin]),
  siteDiaryController.addTask
);

router.patch(
  "/remove-task/:id",
  authVerify([userRoles.employee, userRoles.companyAdmin]),
  siteDiaryController.removeTask
);

router.patch(
  "/remove-workforce/:id",
  authVerify([userRoles.employee, userRoles.companyAdmin]),
  siteDiaryController.removeSiteDiaryWorkforce
);

router.patch(
  "/remove-equipment/:id",
  authVerify([userRoles.employee, userRoles.companyAdmin]),
  siteDiaryController.removeSiteDiaryEquipment
);

router.delete(
  "/:id",
  authVerify([userRoles.employee, userRoles.companyAdmin]),
  siteDiaryController.deleteSiteDiary
);

const siteDiaryRouters = router;

export default siteDiaryRouters;
import { Router } from "express";
import authVerify from "../../middlewares/authVerify";
import { userRoles } from "../../constants/global.constant";
import { summaryController } from "./summary.controller";

const router = Router();

router.get("/stats", authVerify([userRoles.admin]), summaryController.getDashboardStats);
router.get("/earning", authVerify([userRoles.admin]), summaryController.getEarningSummary);

const summaryRoutes = router;

export default summaryRoutes;
import { Router } from "express";
import authRouters from "../modules/auth/auth.routes";
import adminRouters from "../modules/admin/admin.routes";
import paymentRouters from "../modules/payment/payment.routes";
import subscriptionRouters from "../modules/subscription/subscription.routes";
import { settingsRoutes } from "../modules/settings/settings.routes";
import chatRouters from "../modules/chat/chat.routes";
import messageRouters from "../modules/message/message.routes";
import notificationRouters from "../modules/notification/notification.routes";
import companyAdminRouters from "../modules/companyAdmin/companyAdmin.routes";
import projectRoutes from "../modules/project/project.routes";
import employeeRouters from "../modules/employee/employee.routes";
import workforceRoutes from "../modules/workforce/workforce.routes";
import equipmentRoutes from "../modules/equipment/equipment.routes";
import dayWorkRouters from "../modules/dayWork/dayWork.routes";
import planRoutes from "../modules/plan/plan.routes";
import siteDiaryRouters from "../modules/siteDiary/siteDiary.routes";
import folderRoutes from "../modules/folder/folder.routes";
import ductingReportRoutes from "../modules/ductingReport/ductingReport.routes";
import excavationReportRoutes from "../modules/excavationReport/excavationReport.routes";
import postPourInspectionReportRoutes from "../modules/postPourInspectionReport/postPourInspectionReport.routes";
import subscriptionPlanRoutes from "../modules/subscriptionPlan/subscriptionPlan.routes";

const router = Router();

const apiRoutes = [
  { path: "/auth", route: authRouters },
  { path: "/company-admins", route: companyAdminRouters },
  { path: "/projects", route: projectRoutes },
  { path: "/employees", route: employeeRouters },
  { path: "/workforces", route: workforceRoutes },
  { path: "/equipments", route: equipmentRoutes },
  { path: "/day-works", route: dayWorkRouters },
  { path: "/site-diaries", route: siteDiaryRouters },
  { path: "/plans", route: planRoutes },
  { path: "/folders", route: folderRoutes },
  { path: "/ducting-reports", route: ductingReportRoutes },
  { path: "/excavation-reports", route: excavationReportRoutes },
  { path: "/post-pour-inspection-reports", route: postPourInspectionReportRoutes },
  { path: "/subscription-plans", route: subscriptionPlanRoutes },
  { path: "/subscriptions", route: subscriptionRouters },
  { path: "/admins", route: adminRouters },
  { path: "/payments", route: paymentRouters },
  { path: "/settings", route: settingsRoutes },
  { path: "/chats", route: chatRouters },
  { path: "/messages", route: messageRouters },
  { path: "/notifications", route: notificationRouters },
];

apiRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
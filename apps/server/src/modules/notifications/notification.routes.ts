import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import * as notificationController from "./notification.controller.js";

const router: Router = Router();

router.use(authenticate);

router.get("/", notificationController.getNotifications);
router.patch("/read-all", notificationController.markAllNotificationsRead);
router.patch("/:id/read", notificationController.markNotificationRead);

export default router;

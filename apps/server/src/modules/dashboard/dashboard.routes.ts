import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRoles } from "../../middleware/authorize.js";
import * as dashboardController from "./dashboard.controller.js";

const router: Router = Router();

router.use(authenticate);

router.get("/owner", authorizeRoles("OWNER", "ADMIN"), dashboardController.getOwnerDashboard);
router.get("/tenant", authorizeRoles("TENANT", "RENTER", "ADMIN"), dashboardController.getTenantDashboard);

export default router;

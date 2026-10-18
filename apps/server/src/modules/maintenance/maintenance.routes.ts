import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRoles } from "../../middleware/authorize.js";
import * as maintenanceController from "./maintenance.controller.js";

const router: Router = Router();

router.use(authenticate);

router.post("/", authorizeRoles("TENANT", "RENTER", "ADMIN"), maintenanceController.createMaintenance);
router.get("/", maintenanceController.getMaintenanceList);
router.get("/:id", maintenanceController.getMaintenanceById);
router.patch("/:id", authorizeRoles("OWNER", "ADMIN"), maintenanceController.updateMaintenanceStatus);

export default router;

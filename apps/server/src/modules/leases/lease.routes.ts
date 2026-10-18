import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRoles } from "../../middleware/authorize.js";
import * as leaseController from "./lease.controller.js";

const router: Router = Router();

router.use(authenticate);

router.post("/", authorizeRoles("OWNER", "ADMIN"), leaseController.createLease);
router.get("/", leaseController.getLeases);
router.get("/:id", leaseController.getLeaseById);
router.patch("/:id", authorizeRoles("OWNER", "ADMIN"), leaseController.updateLeaseStatus);
router.post("/:id/accept", authorizeRoles("TENANT", "RENTER", "ADMIN"), leaseController.acceptLease);
router.get("/:id/obligations", leaseController.getLeaseObligations);

export default router;

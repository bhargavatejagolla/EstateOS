import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRoles } from "../../middleware/authorize.js";
import * as paymentController from "./payment.controller.js";

const router: Router = Router();

router.use(authenticate);

router.post("/", authorizeRoles("OWNER", "ADMIN"), paymentController.recordPayment);
router.get("/", paymentController.getPayments);

export default router;

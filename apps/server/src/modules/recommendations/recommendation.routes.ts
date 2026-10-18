import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import * as recommendationController from "./recommendation.controller.js";

const router: Router = Router();

router.use(authenticate);

router.get("/", recommendationController.getRecommendations);

export default router;

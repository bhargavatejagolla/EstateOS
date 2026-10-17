import { Router } from "express";
import { EnquiriesController } from "./enquiries.controller.js";
import { authenticate } from "../middleware/authenticate.js";

export const enquiriesRouter: Router = Router();

enquiriesRouter.use(authenticate);

enquiriesRouter.post("/", EnquiriesController.create);
enquiriesRouter.get("/", EnquiriesController.list);
enquiriesRouter.get("/:id", EnquiriesController.getById);
enquiriesRouter.patch("/:id", EnquiriesController.update);

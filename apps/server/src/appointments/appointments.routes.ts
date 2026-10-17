import { Router } from "express";
import { AppointmentsController } from "./appointments.controller.js";
import { authenticate } from "../middleware/authenticate.js";

export const appointmentsRouter: Router = Router();

appointmentsRouter.use(authenticate);

appointmentsRouter.post("/", AppointmentsController.create);
appointmentsRouter.get("/", AppointmentsController.list);
appointmentsRouter.patch("/:id", AppointmentsController.update);

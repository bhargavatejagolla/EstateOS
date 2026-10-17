import { Router } from "express";
import { FavouritesController } from "./favourites.controller.js";
import { authenticate } from "../middleware/authenticate.js";

export const favouritesRouter: Router = Router();

// All favourites endpoints require authentication
favouritesRouter.use(authenticate);

favouritesRouter.get("/", FavouritesController.list);
favouritesRouter.post("/:propertyId", FavouritesController.add);
favouritesRouter.delete("/:propertyId", FavouritesController.remove);

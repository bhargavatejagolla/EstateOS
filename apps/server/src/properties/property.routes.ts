import { Router } from "express";
import multer from "multer";
import { PropertyController } from "./property.controller.js";
import { authenticate, optionalAuthenticate } from "../middleware/authenticate.js";
import { authorizeRoles, authorizeOwnership } from "../middleware/authorize.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

export const propertyRouter: Router = Router();

// Public marketplace property search with optional authentication (for isFavourited)
propertyRouter.get("/", optionalAuthenticate, PropertyController.search);

// Create property (Owner/Admin only)
propertyRouter.post(
  "/",
  authenticate,
  authorizeRoles("OWNER", "ADMIN"),
  PropertyController.create
);

// Get current owner's properties
propertyRouter.get(
  "/mine",
  authenticate,
  authorizeRoles("OWNER", "ADMIN"),
  PropertyController.getMine
);

// Public map pins (must be before /:id)
propertyRouter.get("/map", PropertyController.getMapPins);

// Public get by ID (with optional auth for isFavourited)
propertyRouter.get("/:id", optionalAuthenticate, PropertyController.getById);

// Public property yield estimate
propertyRouter.get("/:id/yield", PropertyController.getYield);

// Publish / unpublish property (Owner or Admin)
propertyRouter.patch(
  "/:id/publish",
  authenticate,
  authorizeRoles("OWNER", "ADMIN"),
  PropertyController.publish
);

// Update property (Owner with ownership check)
propertyRouter.put(
  "/:id",
  authenticate,
  authorizeOwnership,
  PropertyController.update
);

// Delete property (Owner with ownership check)
propertyRouter.delete(
  "/:id",
  authenticate,
  authorizeOwnership,
  PropertyController.delete
);

// Upload property image (Owner with ownership check)
propertyRouter.post(
  "/:id/images",
  authenticate,
  authorizeOwnership,
  upload.single("image"),
  PropertyController.uploadImage
);

// Delete property image (Owner with ownership check)
propertyRouter.delete(
  "/:id/images/:imageId",
  authenticate,
  authorizeOwnership,
  PropertyController.deleteImage
);

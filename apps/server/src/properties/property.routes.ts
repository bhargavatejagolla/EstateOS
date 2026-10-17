import { Router } from "express";
import multer from "multer";
import { PropertyController } from "./property.controller.js";
import { authenticate } from "../middleware/authenticate.js";
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

// Public get by ID
propertyRouter.get("/:id", PropertyController.getById);

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
  upload.single("file"),
  PropertyController.uploadImage
);

// Delete property image (Owner with ownership check)
propertyRouter.delete(
  "/:id/images/:imageId",
  authenticate,
  authorizeOwnership,
  PropertyController.deleteImage
);

import { Router } from "express";
import { healthRouter } from "./health";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);

// Root API index
apiRouter.get("/", (_req, res) => {
  res.json({
    name: "EstateOS API",
    version: "1.0.0",
    docs: "/docs",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      properties: "/api/properties",
      enquiries: "/api/enquiries",
      appointments: "/api/appointments",
      leases: "/api/leases",
      rent: "/api/rent-obligations",
      maintenance: "/api/maintenance-requests",
      dashboard: "/api/dashboard/owner",
    },
  });
});

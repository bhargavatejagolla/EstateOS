import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { healthRouter } from "./routes/health.js";
import { authRouter } from "./auth/auth.routes.js";
import { propertyRouter } from "./properties/property.routes.js";
import { favouritesRouter } from "./favourites/favourites.routes.js";
import { enquiriesRouter } from "./enquiries/enquiries.routes.js";
import { appointmentsRouter } from "./appointments/appointments.routes.js";
import leaseRouter from "./modules/leases/lease.routes.js";
import paymentRouter from "./modules/payments/payment.routes.js";
import maintenanceRouter from "./modules/maintenance/maintenance.routes.js";
import notificationRouter from "./modules/notifications/notification.routes.js";
import dashboardRouter from "./modules/dashboard/dashboard.routes.js";
import recommendationRouter from "./modules/recommendations/recommendation.routes.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

export const app: Express = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/properties", propertyRouter);
app.use("/api/favourites", favouritesRouter);
app.use("/api/enquiries", enquiriesRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/leases", leaseRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/maintenance", maintenanceRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/recommendations", recommendationRouter);

// Fallback error handlers
app.use(notFound);
app.use(errorHandler);

import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { healthRouter } from "./routes/health.js";
import { authRouter } from "./auth/auth.routes.js";
import { propertyRouter } from "./properties/property.routes.js";
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

// Fallback error handlers
app.use(notFound);
app.use(errorHandler);

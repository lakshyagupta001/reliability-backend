import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { appConfig } from './shared/config/app.config';
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/user.routes";
import { errorHandler } from './shared/middlewares/error.middleware';
import { NotFoundError } from './shared/utils/errors/not-found-error';

export const app = express();

const allowedOrigins =
  appConfig.corsOrigin === "*"
    ? "*"
    : appConfig.corsOrigin.split(",").map((origin) => origin.trim());

app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(appConfig.isProduction ? "combined" : "dev"));

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend server is healthy",
    data: {
      service: "reliability-dashboard-backend",
      environment: appConfig.nodeEnv,
      uptime: process.uptime(),
    },
  });
});

app.use(`${appConfig.apiPrefix}/auth`, authRoutes);
app.use(`${appConfig.apiPrefix}/users`, userRoutes);

app.use((req) => {
  throw new NotFoundError(`Route ${req.method} ${req.originalUrl}`);
});

app.use(errorHandler);

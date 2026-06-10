import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { appConfig } from './shared/config/app.config';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import projectRoutes from './modules/projects/project.routes';
import reportRoutes from './modules/reports/report.routes';
import masterDataRoutes from './modules/master-data/master-data.routes';
import uploadRoutes from './modules/uploads/upload.routes';
import { errorHandler } from './shared/middlewares/error.middleware';
import { NotFoundError } from './shared/utils/errors/not-found-error';

export const app = express();

const allowedOrigins =
  appConfig.corsOrigin === '*'
    ? '*'
    : appConfig.corsOrigin.split(',').map((origin) => origin.trim());

app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(appConfig.isProduction ? 'combined' : 'dev'));

app.use('/uploads', express.static('uploads'));

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend server is healthy',
    data: {
      service: 'reliability-dashboard-backend',
      environment: appConfig.nodeEnv,
      uptime: process.uptime(),
    },
  });
});

app.use(`${appConfig.apiPrefix}/auth`, authRoutes);
app.use(`${appConfig.apiPrefix}/users`, userRoutes);
app.use(`${appConfig.apiPrefix}/projects`, projectRoutes);
app.use(`${appConfig.apiPrefix}/reports`, reportRoutes);
app.use(`${appConfig.apiPrefix}/master-data`, masterDataRoutes);
app.use(`${appConfig.apiPrefix}/uploads`, uploadRoutes);

app.use((req) => {
  throw new NotFoundError(`Route ${req.method} ${req.originalUrl}`);
});

app.use(errorHandler);
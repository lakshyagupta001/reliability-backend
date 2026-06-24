import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { appConfig } from './shared/config/app.config';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import projectRoutes from './modules/projects/project.routes';
import masterDataRoutes from './modules/master-data/master-data.routes';
import uploadRoutes from './modules/uploads/upload.routes';
import { errorHandler } from './shared/middlewares/error.middleware';
import { NotFoundError } from './shared/utils/errors/not-found-error';

// New report routers
import { partReportRouter } from './modules/reports/part-reports/part-report.routes';
import { testPartListRouter, partReportTestPartListRouter } from './modules/reports/test-part-lists/test-part-list.routes';
import { summaryReportRouter } from './modules/reports/summary-reports/summary-report.routes';
import { testSummaryListRouter, summaryReportTestSummaryListRouter } from './modules/reports/test-summary-lists/test-summary-list.routes';
import { reportsDashboardRouter } from './modules/reports/reports-dashboard.routes';

export const app = express();

const allowedOrigins =
  appConfig.corsOrigin === '*'
    ? '*'
    : appConfig.corsOrigin.split(',').map((origin) => origin.trim());

app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' }));
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
app.use(`${appConfig.apiPrefix}/master-data`, masterDataRoutes);
app.use(`${appConfig.apiPrefix}/uploads`, uploadRoutes);

// Part Reports
app.use(`${appConfig.apiPrefix}/part-reports`, partReportRouter);
// Test Part Lists (nested under part-reports)
app.use(`${appConfig.apiPrefix}/part-reports/:id/test-part-list`, partReportTestPartListRouter);
// Test Part Lists (standalone)
app.use(`${appConfig.apiPrefix}/test-part-lists`, testPartListRouter);
// Summary Reports
app.use(`${appConfig.apiPrefix}/summary-reports`, summaryReportRouter);
// Test Summary Lists (nested under summary-reports)
app.use(`${appConfig.apiPrefix}/summary-reports/:id/test-summary-list`, summaryReportTestSummaryListRouter);
// Test Summary Lists (standalone)
app.use(`${appConfig.apiPrefix}/test-summary-lists`, testSummaryListRouter);
// Reports Dashboard (aggregations)
app.use(`${appConfig.apiPrefix}/reports`, reportsDashboardRouter);

app.use((req) => {
  throw new NotFoundError(`Route ${req.method} ${req.originalUrl}`);
});

app.use(errorHandler);
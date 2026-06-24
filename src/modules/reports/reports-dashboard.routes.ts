import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { getActiveRequests, getApprovals, getDrafts } from './reports-dashboard.controller';

export const reportsDashboardRouter = Router();

reportsDashboardRouter.get('/active-requests', authenticate, getActiveRequests);
reportsDashboardRouter.get('/approvals', authenticate, getApprovals);
reportsDashboardRouter.get('/drafts', authenticate, getDrafts);

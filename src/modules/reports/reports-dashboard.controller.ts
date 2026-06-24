import type { Response } from 'express';
import { type AuthRequest } from '../../shared/middlewares/auth.middleware';
import { reportsDashboardService } from './reports-dashboard.service';

export const getActiveRequests = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const userId = req.user!.id;
    const requests = await reportsDashboardService.getActiveRequests(userId);
    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

export const getApprovals = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const userId = req.user!.id;
    const approvals = await reportsDashboardService.getApprovals(userId);
    res.json({ success: true, data: approvals });
  } catch (error) {
    next(error);
  }
};

export const getDrafts = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const userId = req.user!.id;
    const drafts = await reportsDashboardService.getDrafts(userId);
    res.json({ success: true, data: drafts });
  } catch (error) {
    next(error);
  }
};

import { z } from 'zod';

export const tslIdParam = z.object({ id: z.string().uuid() });

export const rejectTslSchema = z.object({
  remark: z.string().min(1).max(1000),
});

export const resubmitTslSchema = z.object({});

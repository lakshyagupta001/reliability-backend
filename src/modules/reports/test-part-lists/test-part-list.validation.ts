import { z } from 'zod';

export const tplIdParam = z.object({ id: z.string().uuid() });

export const rejectTplSchema = z.object({
  remark: z.string().min(1).max(1000),
});

export const resubmitTplSchema = z.object({});

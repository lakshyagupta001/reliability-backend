import { NextFunction, Request, Response } from 'express';
import { ZodTypeAny } from 'zod';
import { ValidationError } from '../utils/errors/validation-error';

type RequestValidationSource = 'body' | 'query' | 'params';

// Extend Express Request to carry validated data after middleware runs
declare global {
  namespace Express {
    interface Request {
      validatedBody?: unknown;
      validatedQuery?: unknown;
      validatedParams?: unknown;
    }
  }
}

function validateRequest(source: RequestValidationSource, schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      throw new ValidationError(
        'Validation failed',
        result.error.errors.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      );
    }

    if (source === 'body') req.validatedBody = result.data;
    if (source === 'query') req.validatedQuery = result.data;
    if (source === 'params') req.validatedParams = result.data;

    next();
  };
}

export function validateBody(schema: ZodTypeAny) {
  return validateRequest('body', schema);
}

export function validateQuery(schema: ZodTypeAny) {
  return validateRequest('query', schema);
}

export function validateParams(schema: ZodTypeAny) {
  return validateRequest('params', schema);
}
import { NextFunction, Request, Response } from 'express';
import { ZodTypeAny } from 'zod';
import { ValidationError } from '../utils/errors/validation-error';

type RequestValidationSource = 'body' | 'query' | 'params';

function validateRequest(source: RequestValidationSource, schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const requestData = req as unknown as Record<RequestValidationSource, unknown>;
    const result = schema.safeParse(requestData[source]);

    if (!result.success) {
      throw new ValidationError(
        'Validation failed',
        result.error.errors.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      );
    }

    requestData[source] = result.data;
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

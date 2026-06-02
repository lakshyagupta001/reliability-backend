import { AppError } from './app-error';

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors?: unknown[]) {
    super(message, 400, 'VALIDATION_ERROR', true, errors);
  }
}

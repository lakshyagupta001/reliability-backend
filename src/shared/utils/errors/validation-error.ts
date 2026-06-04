import { AppError } from './app-error';

export class ValidationError extends AppError {
  constructor(message: string, errors?: unknown[]) {
    super(message, 400, 'VALIDATION_ERROR', true, errors);
  }
}
import { AppError } from './app-error';

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication token is missing or invalid') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

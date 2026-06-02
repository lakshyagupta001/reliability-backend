import jwt, { SignOptions } from 'jsonwebtoken';
import { authConfig } from '../config/auth.config';
import { AppError } from './appError';
import { JwtAuthPayload } from '../../modules/auth/auth.types';

export type TokenType = 'access';

export function signAccessToken(payload: JwtAuthPayload): string {
  const options: SignOptions = {
    expiresIn: authConfig.jwtExpiresIn
  };

  return jwt.sign(payload, authConfig.jwtSecret, options);
}

export function verifyToken(token: string, tokenType: TokenType): JwtAuthPayload {
  if (tokenType !== 'access') {
    throw new AppError(401, 'Invalid token type');
  }

  try {
    const decoded = jwt.verify(token, authConfig.jwtSecret);

    if (!isJwtAuthPayload(decoded)) {
      throw new AppError(401, 'Invalid token payload');
    }

    return decoded;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(401, 'Invalid or expired token');
  }
}

export function getTokenExpiryDate(token: string): Date {
  const decoded = jwt.decode(token);

  if (!decoded || typeof decoded !== 'object' || typeof decoded.exp !== 'number') {
    throw new AppError(401, 'Invalid token expiry');
  }

  return new Date(decoded.exp * 1000);
}

function isJwtAuthPayload(value: unknown): value is JwtAuthPayload {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const payload = value as Partial<JwtAuthPayload>;

  return (
    typeof payload.userId === 'string' &&
    typeof payload.sessionId === 'string' &&
    typeof payload.email === 'string' &&
    (payload.role === 'ADMIN' || payload.role === 'EMPLOYEE')
  );
}

import crypto from 'crypto';
import { prisma } from '../../prisma/prisma.client';
import { userRepository } from '../users/user.repository';

export class AuthUserRepository {
  findByEmail(email: string) {
    return userRepository.findByEmail(email);
  }

  findAuthStatusById(userId: string) {
    return userRepository.findAuthStatusById(userId);
  }
}

export class SessionRepository {
  async create(userId: string, token: string, expiresAt: Date, sessionId?: string) {
    return prisma.authSession.create({
      data: {
        ...(sessionId ? { id: sessionId } : {}),
        userId,
        tokenHash: this.hashToken(token),
        expiresAt
      }
    });
  }

  async findActiveByUserId(userId: string) {
    return prisma.authSession.findFirst({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findActiveByUserIdAndToken(userId: string, token: string) {
    return prisma.authSession.findFirst({
      where: {
        userId,
        tokenHash: this.hashToken(token),
        revokedAt: null,
        expiresAt: { gt: new Date() }
      }
    });
  }

  async revokeByToken(token: string) {
    return prisma.authSession.updateMany({
      where: {
        tokenHash: this.hashToken(token),
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    });
  }

  async revokeAllByUserId(userId: string) {
    return prisma.authSession.updateMany({
      where: {
        userId,
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    });
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}

export const authUserRepository = new AuthUserRepository();
export const sessionRepository = new SessionRepository();

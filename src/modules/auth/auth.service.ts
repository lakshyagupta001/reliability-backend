import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { AuthorizationError } from '../../shared/utils/errors/authorization-error';
import { AuthenticationError } from '../../shared/utils/errors/authentication-error';
import {
  getTokenExpiryDate,
  signAccessToken,
  verifyToken,
} from '../../shared/utils/auth';
import { userService } from "../users/user.service";
import { authUserRepository, sessionRepository } from "./auth.repository";
import { LoginRequestBody } from "./auth.types";

export class AuthService {
  async login(credentials: LoginRequestBody) {
    const user = await authUserRepository.findByEmail(credentials.email);

    if (!user) {
      throw new AuthenticationError("Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(
      credentials.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new AuthenticationError("Invalid email or password");
    }

    if (!user.isActive) {
      throw new AuthorizationError("User account is inactive");
    }

    const sessionId = randomUUID();
    const accessToken = signAccessToken({
      userId: user.id,
      sessionId,
      email: user.email,
      role: user.role,
    });
    const expiresAt = getTokenExpiryDate(accessToken);

    await sessionRepository.create(user.id, accessToken, expiresAt, sessionId);

    return {
      accessToken,
      tokenType: "Bearer",
      expiresAt,
      user: userService.toPublicUser(user),
    };
  }

  verifyAccessToken(token: string) {
    return verifyToken(token, "access");
  }

  async logout(token: string) {
    await sessionRepository.revokeByToken(token);
  }
}

export const authService = new AuthService();

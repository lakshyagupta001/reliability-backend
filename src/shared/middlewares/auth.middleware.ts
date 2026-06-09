import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth";
import { AppError } from "../utils/errors/app-error";
import { userService } from '../../modules/users/user.service';
import {
  authUserRepository,
  sessionRepository,
} from '../../modules/auth/auth.repository';
import { PublicUser } from '../../modules/users/user.types';

export interface AuthRequest extends Request {
  user?: PublicUser;
  token?: string;
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new AppError(401, "You are not logged in");
    }

    const decoded = verifyToken(token, "access");

    const session = await sessionRepository.findActiveByUserIdAndToken(
      decoded.userId,
      token,
    );

    if (!session) {
      throw new AppError(401, "Session expired or revoked");
    }

    const user = await authUserRepository.findAuthStatusById(decoded.userId);

    if (!user || !user.isActive) {
      throw new AppError(401, "User not found or inactive");
    }

    req.user = userService.toPublicUser(user);
    req.token = token;

    next();
  } catch (error) {
    next(error);
  }
};



import { Request, Response } from "express";
import { appConfig } from '../../shared/config/app.config';
import { asyncHandler } from '../../shared/utils/async-handler';
import { sendNoContentSuccess, sendSuccess } from '../../shared/utils/api-response';
import { AuthRequest } from '../../shared/middlewares/auth.middleware';
import { authService } from "./auth.service";
import { LoginRequestBody } from "./auth.types";

export const login = asyncHandler(
  async (req: Request<unknown, unknown, LoginRequestBody>, res: Response) => {
    const authData = await authService.login(req.body);

    res.cookie("accessToken", authData.accessToken, {
      httpOnly: true,
      secure: appConfig.isProduction,
      sameSite: "lax",
      expires: authData.expiresAt,
    });

    return sendSuccess(res, 200, "Login successful", authData);
  },
);

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.token) {
    await authService.logout(req.token);
  }

  res.clearCookie("accessToken");

  return sendNoContentSuccess(res, "Logout successful");
});

export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  return sendSuccess(res, 200, "User profile fetched successfully", req.user);
});

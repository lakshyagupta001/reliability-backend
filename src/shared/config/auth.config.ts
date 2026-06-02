import "./env";
import type { SignOptions } from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET || "development_only_change_me";

if (
  process.env.NODE_ENV === "production" &&
  jwtSecret === "development_only_change_me"
) {
  throw new Error("JWT_SECRET must be configured in production");
}

export const authConfig = {
  jwtSecret,
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN ||
    "1d") as SignOptions["expiresIn"],
};

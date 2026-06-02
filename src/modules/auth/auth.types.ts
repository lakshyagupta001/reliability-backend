import { UserRole } from "../users/user.types";

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface JwtAuthPayload {
  userId: string;
  sessionId: string;
  email: string;
  role: UserRole;
}

import type { LoginRequest, LoginResponse } from "../types/auth";
import { authService } from "./authService";

export const loginApi = async (
  payload: LoginRequest,
): Promise<LoginResponse> => {
  return authService.login(payload);
};

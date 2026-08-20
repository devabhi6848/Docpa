import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import { ApiResponse } from "../types/api";
import { AuthResponseData, User, UserRole } from "../types/auth";

export const authService = {
  async getAuthMethods(): Promise<ApiResponse<{ methods: string[] }>> {
    return apiClient.get(ENDPOINTS.AUTH_METHODS);
  },

  async register(data: {
    name?: string;
    email?: string;
    phone?: string;
    password: string;
    role?: UserRole;
    clinic_name?: string;
    specialization?: string;
    registration_number?: string;
    consultation_fee?: number;
  }): Promise<ApiResponse<AuthResponseData>> {
    return apiClient.post(ENDPOINTS.REGISTER, data);
  },

  async login(data: {
    identifier?: string;
    email?: string;
    phone?: string;
    password: string;
  }): Promise<ApiResponse<AuthResponseData>> {
    return apiClient.post(ENDPOINTS.LOGIN, data);
  },

  async sendOtp(data: {
    identifier: string;
    type: "email" | "phone";
  }): Promise<ApiResponse<{ otp?: string; expiresAt?: string }>> {
    return apiClient.post(ENDPOINTS.SEND_OTP, data);
  },

  async registerWithOtp(data: {
    name?: string;
    identifier: string;
    otp: string;
    type: "email" | "phone";
    role?: UserRole;
    password?: string;
  }): Promise<ApiResponse<AuthResponseData>> {
    return apiClient.post(ENDPOINTS.OTP_REGISTER, data);
  },

  async loginWithOtp(data: {
    identifier: string;
    otp: string;
    type: "email" | "phone";
    role?: UserRole;
  }): Promise<ApiResponse<AuthResponseData>> {
    return apiClient.post(ENDPOINTS.OTP_VERIFY, data);
  },

  async loginWithGoogle(data: {
    idToken: string;
    role?: UserRole;
  }): Promise<ApiResponse<AuthResponseData>> {
    return apiClient.post(ENDPOINTS.GOOGLE_LOGIN, data);
  },

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return apiClient.get(ENDPOINTS.ME);
  },

  async updateProfile(data: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    return apiClient.patch(ENDPOINTS.ME, data);
  },

  async logout(refreshToken: string, fcmToken?: string): Promise<ApiResponse<null>> {
    return apiClient.post(ENDPOINTS.LOGOUT, { refreshToken, fcmToken });
  },
};

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { ENV } from "../config/env";
import { Storage } from "../utils/storage";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request Interceptor: Attach Access Token and x-clinic-id header
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await Storage.getSecureItem(ENV.TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const activeClinicId = await Storage.getItem<string>(ENV.ACTIVE_CLINIC_KEY);
      if (activeClinicId && config.headers) {
        config.headers["x-clinic-id"] = activeClinicId;
      }
    } catch (error) {
      console.warn("[API Request Interceptor Warning]", error);
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Response Interceptor: Handle Data Extraction and RTR (Refresh Token Rotation)
apiClient.interceptors.response.use(
  (response: any) => {
    return response.data;
  },
  async (error: AxiosError<any>) => {
    const originalRequest: any = error.config;

    // Handle Network Connection Errors
    if (!error.response) {
      return Promise.reject({
        message: "Unable to connect to server. Please check your internet connection or server status.",
        statusCode: 0,
      });
    }

    const { status, data } = error.response;

    // Handle 401 Unauthorized with Automatic Refresh Token Rotation
    if (status === 401 && !originalRequest._retry && !originalRequest.url?.includes("/v1/users/login") && !originalRequest.url?.includes("/v1/users/refresh")) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await Storage.getSecureItem(ENV.REFRESH_TOKEN_KEY);
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const refreshRes = await axios.post(`${ENV.API_BASE_URL}/v1/users/refresh`, {
          refreshToken,
        });

        const newTokens = refreshRes.data?.data?.tokens;
        if (newTokens?.accessToken) {
          await Storage.setSecureItem(ENV.TOKEN_KEY, newTokens.accessToken);
          if (newTokens.refreshToken) {
            await Storage.setSecureItem(ENV.REFRESH_TOKEN_KEY, newTokens.refreshToken);
          }

          apiClient.defaults.headers.common["Authorization"] = `Bearer ${newTokens.accessToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${newTokens.accessToken}`;

          processQueue(null, newTokens.accessToken);
          return apiClient(originalRequest);
        } else {
          throw new Error("Invalid token refresh response");
        }
      } catch (refreshErr) {
        processQueue(refreshErr as Error, null);
        // Clear secure storage on invalid token
        await Storage.removeSecureItem(ENV.TOKEN_KEY);
        await Storage.removeSecureItem(ENV.REFRESH_TOKEN_KEY);
        await Storage.removeItem(ENV.USER_DATA_KEY);

        return Promise.reject({
          message: "Session expired. Please log in again.",
          statusCode: 401,
        });
      } finally {
        isRefreshing = false;
      }
    }

    // Format standardized API errors
    const errorMessage =
      data?.message ||
      (Array.isArray(data?.errors) ? data.errors.join(", ") : null) ||
      error.message ||
      "An unexpected error occurred.";

    return Promise.reject({
      message: errorMessage,
      statusCode: status,
      errors: data?.errors,
    });
  }
);

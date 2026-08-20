import { Platform } from "react-native";

declare const process: {
  env: {
    NODE_ENV?: string;
    EXPO_PUBLIC_API_URL?: string;
    [key: string]: any;
  };
};

const getBaseUrl = (): string => {
  // Check if custom API URL is set in environment
  if (process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Default production backend on Render
  return "https://docpa.onrender.com/api";
};

export const ENV = {
  API_BASE_URL: getBaseUrl(),
  API_TIMEOUT: 20000,
  APP_VERSION: "1.0.0",
  TOKEN_KEY: "docpa_access_token",
  REFRESH_TOKEN_KEY: "docpa_refresh_token",
  USER_DATA_KEY: "docpa_user_data",
  ACTIVE_CLINIC_KEY: "docpa_active_clinic_id",
  THEME_PREF_KEY: "docpa_theme_preference",
};

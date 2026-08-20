export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  accentLight: string;
  background: string;
  surface: string;
  surfaceSubtle: string;
  card: string;
  cardBorder: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  divider: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  danger: string;
  dangerLight: string;
  info: string;
  infoLight: string;
  inputBg: string;
  inputBorder: string;
  inputFocusBorder: string;
  tabBarBg: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;
}

export const lightColors: ThemeColors = {
  primary: "#0D9488",        // Medical Teal
  primaryLight: "#CCFBF1",
  primaryDark: "#0F766E",
  accent: "#2563EB",         // Clinical Indigo
  accentLight: "#DBEAFE",
  background: "#F8FAFC",     // Slate 50
  surface: "#FFFFFF",
  surfaceSubtle: "#F1F5F9",
  card: "#FFFFFF",
  cardBorder: "#E2E8F0",
  text: "#0F172A",           // Slate 900
  textSecondary: "#475569",  // Slate 600
  textMuted: "#94A3B8",      // Slate 400
  border: "#E2E8F0",
  divider: "#EEF2F6",
  success: "#10B981",        // Emerald
  successLight: "#D1FAE5",
  warning: "#F59E0B",        // Amber
  warningLight: "#FEF3C7",
  danger: "#EF4444",         // Rose
  dangerLight: "#FEE2E2",
  info: "#3B82F6",           // Sky
  infoLight: "#EFF6FF",
  inputBg: "#F8FAFC",
  inputBorder: "#CBD5E1",
  inputFocusBorder: "#0D9488",
  tabBarBg: "#FFFFFF",
  tabBarBorder: "#E2E8F0",
  tabBarActive: "#0D9488",
  tabBarInactive: "#94A3B8",
};

export const darkColors: ThemeColors = {
  primary: "#14B8A6",
  primaryLight: "#134E4A",
  primaryDark: "#0D9488",
  accent: "#3B82F6",
  accentLight: "#1E3A8A",
  background: "#090D16",     // Deep medical dark
  surface: "#0F172A",        // Slate 900
  surfaceSubtle: "#1E293B",  // Slate 800
  card: "#131C2E",
  cardBorder: "#1E293B",
  text: "#F8FAFC",           // Slate 50
  textSecondary: "#94A3B8",  // Slate 400
  textMuted: "#64748B",      // Slate 500
  border: "#1E293B",
  divider: "#172033",
  success: "#34D399",
  successLight: "#064E3B",
  warning: "#FBBF24",
  warningLight: "#78350F",
  danger: "#F87171",
  dangerLight: "#7F1D1D",
  info: "#60A5FA",
  infoLight: "#1E3A8A",
  inputBg: "#131C2E",
  inputBorder: "#334155",
  inputFocusBorder: "#14B8A6",
  tabBarBg: "#0F172A",
  tabBarBorder: "#1E293B",
  tabBarActive: "#14B8A6",
  tabBarInactive: "#64748B",
};

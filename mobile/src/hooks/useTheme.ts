import { useColorScheme } from "react-native";
import { useAuthStore } from "../store/authStore";
import { darkColors, lightColors, ThemeColors } from "../constants/colors";

export const useTheme = (): {
  colors: ThemeColors;
  isDark: boolean;
  themeMode: "light" | "dark" | "system";
  setThemeMode: (mode: "light" | "dark" | "system") => void;
} => {
  const systemColorScheme = useColorScheme();
  const themeMode = useAuthStore((state) => state.themeMode);
  const setThemeMode = useAuthStore((state) => state.setThemeMode);

  const isDark =
    themeMode === "dark" || (themeMode === "system" && systemColorScheme === "dark");

  const colors = isDark ? darkColors : lightColors;

  return {
    colors,
    isDark,
    themeMode,
    setThemeMode,
  };
};

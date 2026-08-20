import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "./src/store/authStore";
import { useTheme } from "./src/hooks/useTheme";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { ToastContainer } from "./src/components/ui/Toast";
import { OfflineBanner } from "./src/components/ui/OfflineBanner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 30, // 30 seconds
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const initAuth = useAuthStore((state) => state.initAuth);
  const { isDark, colors } = useTheme();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer theme={navTheme}>
          <StatusBar style={isDark ? "light" : "dark"} />
          <OfflineBanner />
          <RootNavigator />
          <ToastContainer />
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

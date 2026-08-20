import { create } from "zustand";
import { User, AuthTokens, UserRole } from "../types/auth";
import { Clinic } from "../types/clinic";
import { Storage } from "../utils/storage";
import { ENV } from "../config/env";
import { authService } from "../services/auth.service";

export type ThemeMode = "light" | "dark" | "system";

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  activeClinic: Clinic | null;
  myClinics: Clinic[];
  isAuthenticated: boolean;
  isLoading: boolean;
  themeMode: ThemeMode;
  role: UserRole | null;

  // Actions
  setAuth: (user: User, tokens: AuthTokens, activeClinic?: Clinic | null) => Promise<void>;
  setActiveClinic: (clinic: Clinic) => Promise<void>;
  setMyClinics: (clinics: Clinic[]) => void;
  updateUser: (updatedUser: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  tokens: null,
  activeClinic: null,
  myClinics: [],
  isAuthenticated: false,
  isLoading: true,
  themeMode: "system",
  role: null,

  setAuth: async (user: User, tokens: AuthTokens, activeClinic: Clinic | null = null) => {
    await Storage.setSecureItem(ENV.TOKEN_KEY, tokens.accessToken);
    if (tokens.refreshToken) {
      await Storage.setSecureItem(ENV.REFRESH_TOKEN_KEY, tokens.refreshToken);
    }
    await Storage.setItem(ENV.USER_DATA_KEY, user);
    if (activeClinic) {
      await Storage.setItem(ENV.ACTIVE_CLINIC_KEY, activeClinic._id);
    } else if (user.active_clinic_id) {
      await Storage.setItem(ENV.ACTIVE_CLINIC_KEY, user.active_clinic_id);
    }

    set({
      user,
      tokens,
      activeClinic,
      isAuthenticated: true,
      role: user.role,
      isLoading: false,
    });
  },

  setActiveClinic: async (clinic: Clinic) => {
    await Storage.setItem(ENV.ACTIVE_CLINIC_KEY, clinic._id);
    set({ activeClinic: clinic });
  },

  setMyClinics: (clinics: Clinic[]) => {
    set({ myClinics: clinics });
    // If active clinic is not yet set, default to first clinic
    const currentActive = get().activeClinic;
    if (!currentActive && clinics.length > 0) {
      const activeId = get().user?.active_clinic_id;
      const found = clinics.find((c) => c._id === activeId) || clinics[0];
      set({ activeClinic: found });
      Storage.setItem(ENV.ACTIVE_CLINIC_KEY, found._id);
    }
  },

  updateUser: async (updatedUser: Partial<User>) => {
    const current = get().user;
    if (!current) return;
    const merged = { ...current, ...updatedUser };
    await Storage.setItem(ENV.USER_DATA_KEY, merged);
    set({ user: merged, role: merged.role });
  },

  logout: async () => {
    try {
      const refreshToken = await Storage.getSecureItem(ENV.REFRESH_TOKEN_KEY);
      if (refreshToken) {
        await authService.logout(refreshToken).catch(() => {});
      }
    } catch {
      // Ignore network errors during logout
    } finally {
      await Storage.removeSecureItem(ENV.TOKEN_KEY);
      await Storage.removeSecureItem(ENV.REFRESH_TOKEN_KEY);
      await Storage.removeItem(ENV.USER_DATA_KEY);
      await Storage.removeItem(ENV.ACTIVE_CLINIC_KEY);

      set({
        user: null,
        tokens: null,
        activeClinic: null,
        myClinics: [],
        isAuthenticated: false,
        role: null,
        isLoading: false,
      });
    }
  },

  initAuth: async () => {
    set({ isLoading: true });
    try {
      const [token, refreshToken, cachedUser, cachedTheme] = await Promise.all([
        Storage.getSecureItem(ENV.TOKEN_KEY),
        Storage.getSecureItem(ENV.REFRESH_TOKEN_KEY),
        Storage.getItem<User>(ENV.USER_DATA_KEY),
        Storage.getItem<ThemeMode>(ENV.THEME_PREF_KEY),
      ]);

      if (cachedTheme) {
        set({ themeMode: cachedTheme });
      }

      if (token && cachedUser) {
        set({
          user: cachedUser,
          tokens: { accessToken: token, refreshToken: refreshToken || "" },
          isAuthenticated: true,
          role: cachedUser.role,
        });

        // Background profile and clinic refresh
        authService
          .getProfile()
          .then(async (res) => {
            const freshUser = res.data?.user;
            if (freshUser) {
              await Storage.setItem(ENV.USER_DATA_KEY, freshUser);
              set({ user: freshUser, role: freshUser.role });
            }
          })
          .catch(() => {});
      } else {
        set({ isAuthenticated: false, user: null, tokens: null });
      }
    } catch (e) {
      console.warn("[Auth Store Init Error]", e);
      set({ isAuthenticated: false, user: null, tokens: null });
    } finally {
      set({ isLoading: false });
    }
  },

  setThemeMode: async (mode: ThemeMode) => {
    await Storage.setItem(ENV.THEME_PREF_KEY, mode);
    set({ themeMode: mode });
  },
}));

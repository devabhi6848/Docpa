import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export const Storage = {
  // Secure Storage for Sensitive Tokens
  async setSecureItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === "web") {
        await AsyncStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (e) {
      await AsyncStorage.setItem(key, value);
    }
  },

  async getSecureItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === "web") {
        return await AsyncStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      return await AsyncStorage.getItem(key);
    }
  },

  async removeSecureItem(key: string): Promise<void> {
    try {
      if (Platform.OS === "web") {
        await AsyncStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (e) {
      await AsyncStorage.removeItem(key);
    }
  },

  // Standard Storage for Non-Sensitive Preferences & UI State
  async setItem(key: string, value: any): Promise<void> {
    const jsonValue = typeof value === "string" ? value : JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  },

  async getItem<T>(key: string): Promise<T | null> {
    const value = await AsyncStorage.getItem(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  },

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.clear();
  },
};

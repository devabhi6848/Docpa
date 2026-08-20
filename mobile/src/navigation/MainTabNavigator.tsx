import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MainTabParamList } from "./types";
import { useTheme } from "../hooks/useTheme";
import { QueueDashboardScreen } from "../screens/queue/QueueDashboardScreen";
import { PatientListScreen } from "../screens/patients/PatientListScreen";
import { DailyCollectionScreen } from "../screens/billing/DailyCollectionScreen";
import { AnalyticsDashboardScreen } from "../screens/analytics/AnalyticsDashboardScreen";
import { ProfileScreen } from "../screens/profile/ProfileScreen";
import { Typography } from "../constants/layout";

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="QueueTab"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBarBg,
          borderTopColor: colors.tabBarBorder,
          height: Platform.OS === "ios" ? 84 : 64,
          paddingBottom: Platform.OS === "ios" ? 24 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: Typography.sizes.xs,
          fontWeight: Typography.weights.semibold,
        },
      }}
    >
      <Tab.Screen
        name="QueueTab"
        component={QueueDashboardScreen}
        options={{
          tabBarLabel: "OPD Queue",
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20, color }}>👥</Text>
          ),
        }}
      />

      <Tab.Screen
        name="PatientsTab"
        component={PatientListScreen}
        options={{
          tabBarLabel: "Patients",
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20, color }}>📋</Text>
          ),
        }}
      />

      <Tab.Screen
        name="BillingTab"
        component={DailyCollectionScreen}
        options={{
          tabBarLabel: "Billing",
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20, color }}>💳</Text>
          ),
        }}
      />

      <Tab.Screen
        name="AnalyticsTab"
        component={AnalyticsDashboardScreen}
        options={{
          tabBarLabel: "Analytics",
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20, color }}>📊</Text>
          ),
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Account",
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20, color }}>⚙️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

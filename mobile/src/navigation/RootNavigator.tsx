import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import { useAuthStore } from "../store/authStore";
import { useTheme } from "../hooks/useTheme";

// Navigators
import { AuthNavigator } from "./AuthNavigator";
import { MainTabNavigator } from "./MainTabNavigator";

// Feature Screens & Modals
import { GenerateTokenScreen } from "../screens/queue/GenerateTokenScreen";
import { TvDisplayScreen } from "../screens/queue/TvDisplayScreen";
import { PatientDetailScreen } from "../screens/patients/PatientDetailScreen";
import { AddPatientScreen } from "../screens/patients/AddPatientScreen";
import { VitalsTimelineScreen } from "../screens/patients/VitalsTimelineScreen";
import { PrescriptionCreateScreen } from "../screens/prescription/PrescriptionCreateScreen";
import { PrescriptionDetailScreen } from "../screens/prescription/PrescriptionDetailScreen";
import { TemplateManagerScreen } from "../screens/prescription/TemplateManagerScreen";
import { VaccineScheduleScreen } from "../screens/pediatric/VaccineScheduleScreen";
import { GrowthTrackerScreen } from "../screens/pediatric/GrowthTrackerScreen";
import { CreateInvoiceScreen } from "../screens/billing/CreateInvoiceScreen";
import { TeleconsultationListScreen } from "../screens/teleconsultation/TeleconsultationListScreen";
import { VideoCallScreen } from "../screens/teleconsultation/VideoCallScreen";
import { ClinicSettingsScreen } from "../screens/profile/ClinicSettingsScreen";
import { StaffManagementScreen } from "../screens/profile/StaffManagementScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { colors } = useTheme();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    return (
      <View style={[styles.splashContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />

          {/* Queue & OPD */}
          <Stack.Screen
            name="GenerateToken"
            component={GenerateTokenScreen}
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="TvDisplay"
            component={TvDisplayScreen}
            options={{ orientation: "all" }}
          />

          {/* Patients & EHR */}
          <Stack.Screen name="PatientDetail" component={PatientDetailScreen} />
          <Stack.Screen
            name="AddPatient"
            component={AddPatientScreen}
            options={{ presentation: "modal" }}
          />
          <Stack.Screen name="VitalsTimeline" component={VitalsTimelineScreen} />

          {/* Smart Prescription */}
          <Stack.Screen
            name="PrescriptionCreate"
            component={PrescriptionCreateScreen}
            options={{ presentation: "modal" }}
          />
          <Stack.Screen name="PrescriptionDetail" component={PrescriptionDetailScreen} />
          <Stack.Screen name="TemplateManager" component={TemplateManagerScreen} />

          {/* Pediatric Module */}
          <Stack.Screen name="VaccineSchedule" component={VaccineScheduleScreen} />
          <Stack.Screen name="GrowthTracker" component={GrowthTrackerScreen} />

          {/* Billing */}
          <Stack.Screen
            name="CreateInvoice"
            component={CreateInvoiceScreen}
            options={{ presentation: "modal" }}
          />

          {/* Teleconsultation */}
          <Stack.Screen name="TeleconsultationList" component={TeleconsultationListScreen} />
          <Stack.Screen
            name="VideoCall"
            component={VideoCallScreen}
            options={{ presentation: "fullScreenModal" }}
          />

          {/* Profile & Clinic */}
          <Stack.Screen name="ClinicSettings" component={ClinicSettingsScreen} />
          <Stack.Screen name="StaffManagement" component={StaffManagementScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

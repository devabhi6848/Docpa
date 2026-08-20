import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/types";
import { useTheme } from "../../hooks/useTheme";
import { Header } from "../../components/ui/Header";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { Spacing, Typography, BorderRadius } from "../../constants/layout";

export const TeleconsultationListScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title="Teleconsultations" showBack subtitle="Online Video & Audio OPD" />

      <View style={styles.content}>
        <EmptyState
          title="Teleconsultation Ready"
          description="Schedule instant encrypted video sessions or audio consultations with remote patients."
          actionTitle="📞 Join Test Consultation Room"
          onAction={() => navigation.navigate("VideoCall", { meetingId: "DOCPA-MEET-TEST", roomUrl: "https://meet.jit.si/docpa-teleconsult-sample" })}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: "center",
  },
});

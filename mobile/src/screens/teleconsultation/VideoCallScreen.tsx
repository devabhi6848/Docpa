import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/types";
import { useTheme } from "../../hooks/useTheme";
import { Header } from "../../components/ui/Header";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Spacing, Typography, BorderRadius } from "../../constants/layout";

type VideoRouteProp = RouteProp<RootStackParamList, "VideoCall">;

export const VideoCallScreen: React.FC = () => {
  const { colors } = useTheme();
  const route = useRoute<VideoRouteProp>();
  const navigation = useNavigation();
  const { meetingId, roomUrl } = route.params;

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Active Video Consultation" showBack subtitle={`Meeting: ${meetingId}`} />

      {/* Video Feed Placeholder / Meeting Stage */}
      <View style={styles.videoStage}>
        <View style={styles.videoFrame}>
          <Text style={styles.patientVideoInitial}>👤</Text>
          <Text style={styles.patientVideoText}>Patient Video Feed (Connected)</Text>
          <Text style={styles.meetingIdText}>Encrypted WebRTC Room: {meetingId}</Text>
        </View>

        {/* Floating Doctor Self-View */}
        <View style={styles.selfView}>
          <Text style={{ color: "#FFFFFF", fontSize: 12 }}>👨‍⚕️ You</Text>
        </View>
      </View>

      {/* Call Controls */}
      <View style={styles.controlsBar}>
        <TouchableOpacity
          onPress={() => setIsMuted(!isMuted)}
          style={[styles.controlBtn, isMuted && { backgroundColor: "#EF4444" }]}
        >
          <Text style={styles.controlIcon}>{isMuted ? "🔇" : "🎙️"}</Text>
          <Text style={styles.controlLabel}>{isMuted ? "Unmute" : "Mute"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsVideoOff(!isVideoOff)}
          style={[styles.controlBtn, isVideoOff && { backgroundColor: "#EF4444" }]}
        >
          <Text style={styles.controlIcon}>{isVideoOff ? "🚫" : "📹"}</Text>
          <Text style={styles.controlLabel}>{isVideoOff ? "Start Video" : "Stop Video"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.controlBtn, { backgroundColor: "#DC2626" }]}
        >
          <Text style={styles.controlIcon}>📞</Text>
          <Text style={styles.controlLabel}>End Call</Text>
        </TouchableOpacity>
      </View>

      {/* Doctor In-Call Notes */}
      <View style={styles.notesContainer}>
        <Input
          placeholder="Type consultation notes while on video call..."
          value={doctorNotes}
          onChangeText={setDoctorNotes}
          multiline
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1120",
  },
  videoStage: {
    flex: 1,
    margin: Spacing.md,
    borderRadius: BorderRadius.xl,
    backgroundColor: "#1E293B",
    position: "relative",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  videoFrame: {
    alignItems: "center",
  },
  patientVideoInitial: {
    fontSize: 64,
    marginBottom: Spacing.sm,
  },
  patientVideoText: {
    color: "#F8FAFC",
    fontSize: Typography.sizes.lg,
    fontWeight: "bold",
  },
  meetingIdText: {
    color: "#94A3B8",
    fontSize: Typography.sizes.xs,
    marginTop: 4,
  },
  selfView: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 90,
    height: 120,
    borderRadius: BorderRadius.md,
    backgroundColor: "#334155",
    borderWidth: 1.5,
    borderColor: "#14B8A6",
    alignItems: "center",
    justifyContent: "center",
  },
  controlsBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: Spacing.md,
    backgroundColor: "#0F172A",
  },
  controlBtn: {
    width: 72,
    height: 64,
    borderRadius: BorderRadius.lg,
    backgroundColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
  },
  controlIcon: {
    fontSize: 20,
  },
  controlLabel: {
    color: "#FFFFFF",
    fontSize: Typography.sizes.xs - 2,
    marginTop: 2,
    fontWeight: "bold",
  },
  notesContainer: {
    padding: Spacing.md,
    backgroundColor: "#0F172A",
  },
});

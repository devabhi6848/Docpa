import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Modal } from "../ui/Modal";
import { useAuthStore } from "../../store/authStore";
import { useTheme } from "../../hooks/useTheme";
import { clinicService } from "../../services/clinic.service";
import { useUIStore } from "../../store/uiStore";
import { Clinic } from "../../types/clinic";
import { Spacing, Typography, BorderRadius } from "../../constants/layout";

interface ClinicSelectorModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ClinicSelectorModal: React.FC<ClinicSelectorModalProps> = ({
  visible,
  onClose,
}) => {
  const { colors } = useTheme();
  const myClinics = useAuthStore((state) => state.myClinics);
  const activeClinic = useAuthStore((state) => state.activeClinic);
  const setActiveClinic = useAuthStore((state) => state.setActiveClinic);
  const showToast = useUIStore((state) => state.showToast);

  const handleSelectClinic = async (clinic: Clinic) => {
    try {
      await clinicService.switchActiveClinic(clinic._id);
      await setActiveClinic(clinic);
      showToast(`Switched active clinic to ${clinic.name}`, "success");
      onClose();
    } catch (err: any) {
      showToast(err.message || "Failed to switch clinic", "error");
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Switch Active Clinic">
      <View style={styles.container}>
        {myClinics.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            No clinics found associated with your account.
          </Text>
        ) : (
          myClinics.map((clinic) => {
            const isSelected = activeClinic?._id === clinic._id;
            return (
              <TouchableOpacity
                key={clinic._id}
                onPress={() => handleSelectClinic(clinic)}
                style={[
                  styles.clinicItem,
                  {
                    backgroundColor: isSelected ? colors.primaryLight : colors.surfaceSubtle,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <View style={styles.clinicInfo}>
                  <Text
                    style={[
                      styles.clinicName,
                      { color: isSelected ? colors.primary : colors.text },
                    ]}
                  >
                    {clinic.name}
                  </Text>
                  {clinic.tagline ? (
                    <Text style={[styles.clinicTagline, { color: colors.textMuted }]}>
                      {clinic.tagline}
                    </Text>
                  ) : null}
                  {clinic.address?.city ? (
                    <Text style={[styles.clinicAddress, { color: colors.textSecondary }]}>
                      📍 {clinic.address.city}, {clinic.address.state || "India"}
                    </Text>
                  ) : null}
                </View>
                {isSelected && (
                  <View style={[styles.activeBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.activeBadgeText}>ACTIVE</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.xs,
  },
  emptyText: {
    textAlign: "center",
    padding: Spacing.lg,
  },
  clinicItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    marginBottom: Spacing.sm,
  },
  clinicInfo: {
    flex: 1,
  },
  clinicName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  clinicTagline: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  clinicAddress: {
    fontSize: Typography.sizes.xs,
    marginTop: 4,
  },
  activeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.round,
    marginLeft: Spacing.sm,
  },
  activeBadgeText: {
    color: "#FFFFFF",
    fontSize: Typography.sizes.xs - 2,
    fontWeight: "bold",
  },
});

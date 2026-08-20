import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { AppointmentToken, TokenStatus } from "../../types/queue";
import { useUpdateTokenStatus } from "../../hooks/useQueue";
import { Spacing, Typography } from "../../constants/layout";
import { useTheme } from "../../hooks/useTheme";

interface TokenActionModalProps {
  visible: boolean;
  token: AppointmentToken | null;
  onClose: () => void;
  onNavigateToRx?: (token: AppointmentToken) => void;
  onNavigateToVitals?: (token: AppointmentToken) => void;
  onNavigateToBilling?: (token: AppointmentToken) => void;
}

export const TokenActionModal: React.FC<TokenActionModalProps> = ({
  visible,
  token,
  onClose,
  onNavigateToRx,
  onNavigateToVitals,
  onNavigateToBilling,
}) => {
  const { colors } = useTheme();
  const updateStatusMutation = useUpdateTokenStatus();

  if (!token) return null;

  const handleUpdateStatus = (status: TokenStatus) => {
    updateStatusMutation.mutate(
      { tokenId: token._id, status },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={`Token #${token.token_number} — ${token.patient_id?.name || "Patient"}`}
    >
      <View style={styles.content}>
        <View style={[styles.infoBanner, { backgroundColor: colors.surfaceSubtle }]}>
          <Text style={[styles.infoText, { color: colors.text }]}>
            UHID: <Text style={{ fontWeight: "bold" }}>{token.patient_id?.uhid || "N/A"}</Text> | Visit:{" "}
            <Text style={{ textTransform: "capitalize", fontWeight: "bold" }}>
              {token.visit_type.replace("_", " ")}
            </Text>
          </Text>
          {token.chief_complaint ? (
            <Text style={[styles.complaintText, { color: colors.textSecondary }]}>
              Chief Complaint: {token.chief_complaint}
            </Text>
          ) : null}
        </View>

        <Text style={[styles.actionsHeader, { color: colors.textSecondary }]}>OPD Workflow Actions</Text>

        {/* Primary Consultation Actions */}
        {token.status === "waiting" && (
          <Button
            title="📞 Call Patient (With Doctor)"
            onPress={() => handleUpdateStatus("with_doctor")}
            variant="primary"
            style={styles.actionButton}
            isLoading={updateStatusMutation.isPending}
          />
        )}

        {token.status === "with_doctor" && (
          <>
            {onNavigateToRx && (
              <Button
                title="📝 Open Smart Prescription (Rx)"
                onPress={() => {
                  onClose();
                  onNavigateToRx(token);
                }}
                variant="primary"
                style={styles.actionButton}
              />
            )}
            <Button
              title="✅ Mark Consultation Completed"
              onPress={() => handleUpdateStatus("completed")}
              variant="secondary"
              style={styles.actionButton}
              isLoading={updateStatusMutation.isPending}
            />
          </>
        )}

        {/* Ancillary actions */}
        {onNavigateToVitals && (
          <Button
            title="🩺 Record / Update Vitals"
            onPress={() => {
              onClose();
              onNavigateToVitals(token);
            }}
            variant="outline"
            style={styles.actionButton}
          />
        )}

        {onNavigateToBilling && (
          <Button
            title="💳 Generate OPD Invoice"
            onPress={() => {
              onClose();
              onNavigateToBilling(token);
            }}
            variant="outline"
            style={styles.actionButton}
          />
        )}

        {/* Cancel / No Show */}
        {token.status !== "completed" && token.status !== "cancelled" && (
          <View style={styles.dangerRow}>
            <Button
              title="No Show"
              onPress={() => handleUpdateStatus("no_show")}
              variant="secondary"
              size="sm"
              style={{ flex: 0.48 }}
            />
            <Button
              title="Cancel Token"
              onPress={() => handleUpdateStatus("cancelled")}
              variant="danger"
              size="sm"
              style={{ flex: 0.48 }}
            />
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingVertical: Spacing.xs,
  },
  infoBanner: {
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.lg,
  },
  infoText: {
    fontSize: Typography.sizes.sm,
  },
  complaintText: {
    fontSize: Typography.sizes.xs,
    marginTop: 4,
  },
  actionsHeader: {
    fontSize: Typography.sizes.xs,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: Spacing.sm,
  },
  actionButton: {
    marginBottom: Spacing.sm,
  },
  dangerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.sm,
  },
});

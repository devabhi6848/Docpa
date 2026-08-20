import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../../hooks/useTheme";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import { clinicService } from "../../services/clinic.service";
import { Header } from "../../components/ui/Header";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { ClinicStaff } from "../../types/clinic";
import { Spacing, Typography, BorderRadius } from "../../constants/layout";

const STAFF_ROLES = ["doctor", "receptionist", "nurse", "clinic_admin"] as const;

export const StaffManagementScreen: React.FC = () => {
  const { colors } = useTheme();
  const activeClinic = useAuthStore((state) => state.activeClinic);
  const showToast = useUIStore((state) => state.showToast);
  const queryClient = useQueryClient();

  const [showAddModal, setShowAddModal] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [role, setRole] = useState<typeof STAFF_ROLES[number]>("receptionist");
  const [designation, setDesignation] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["clinicStaff", activeClinic?._id],
    queryFn: async () => {
      if (!activeClinic) return [];
      const res = await clinicService.getClinicStaff(activeClinic._id);
      return res.data?.staff || [];
    },
    enabled: Boolean(activeClinic),
  });

  const addStaffMutation = useMutation({
    mutationFn: async () => {
      if (!activeClinic) return;
      return clinicService.addStaff(activeClinic._id, {
        identifier: identifier.trim(),
        role,
        designation: designation.trim() || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinicStaff", activeClinic?._id] });
      showToast("Staff member added to clinic", "success");
      setShowAddModal(false);
      setIdentifier("");
      setDesignation("");
    },
    onError: (err: any) => {
      showToast(err.message || "Failed to add staff member", "error");
    },
  });

  const removeStaffMutation = useMutation({
    mutationFn: async (staffId: string) => {
      if (!activeClinic) return;
      return clinicService.removeStaff(activeClinic._id, staffId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinicStaff", activeClinic?._id] });
      showToast("Staff member removed", "success");
    },
    onError: (err: any) => {
      showToast(err.message || "Failed to remove staff", "error");
    },
  });

  const handleRemove = (staff: ClinicStaff) => {
    Alert.alert(
      "Remove Staff Member",
      `Are you sure you want to remove ${staff.user_id?.name || "this staff member"} from the clinic?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeStaffMutation.mutate(staff._id),
        },
      ]
    );
  };

  const renderStaffItem = ({ item }: { item: ClinicStaff }) => {
    return (
      <Card style={styles.card}>
        <View style={styles.staffRow}>
          <View style={[styles.avatar, { backgroundColor: colors.surfaceSubtle }]}>
            <Text style={{ fontSize: 20 }}>👤</Text>
          </View>

          <View style={styles.staffInfo}>
            <Text style={[styles.staffName, { color: colors.text }]}>
              {item.user_id?.name || item.user_id?.email || "Staff Member"}
            </Text>
            <Text style={[styles.staffRole, { color: colors.textSecondary }]}>
              {item.designation || item.role.toUpperCase()}
            </Text>
            <Text style={[styles.staffContact, { color: colors.textMuted }]}>
              {item.user_id?.email || item.user_id?.phone || ""}
            </Text>
          </View>

          <View style={styles.actionsCol}>
            <Badge label={item.status} variant={item.status === "active" ? "success" : "neutral"} size="sm" />
            <TouchableOpacity onPress={() => handleRemove(item)} style={styles.delBtn}>
              <Text style={{ color: colors.danger, fontSize: Typography.sizes.xs, fontWeight: "bold" }}>
                Remove
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    );
  };

  const staffList = data || [];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header
        title="Clinic Staff"
        showBack
        subtitle={activeClinic?.name}
        rightAction={
          <Button
            title="+ Add Staff"
            size="sm"
            onPress={() => setShowAddModal(true)}
          />
        }
      />

      {isLoading ? (
        <View style={{ padding: Spacing.lg }}>
          <Skeleton height={80} borderRadius={16} />
          <Skeleton height={80} borderRadius={16} style={{ marginTop: Spacing.md }} />
        </View>
      ) : (
        <FlatList
          data={staffList}
          keyExtractor={(item) => item._id}
          renderItem={renderStaffItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              title="No staff members added"
              description="Add doctors, receptionists or nurses to collaborate on this clinic."
              actionTitle="+ Add First Staff Member"
              onAction={() => setShowAddModal(true)}
            />
          }
        />
      )}

      {/* Add Staff Modal */}
      <Modal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Staff to Clinic"
        footer={
          <Button
            title="Add Staff Member"
            onPress={() => addStaffMutation.mutate()}
            isLoading={addStaffMutation.isPending}
            disabled={!identifier.trim()}
          />
        }
      >
        <Input
          label="Staff Email or Phone Number *"
          placeholder="e.g. nurse@clinic.com or 9876543210"
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Staff Role *</Text>
        <View style={styles.chipsRow}>
          {STAFF_ROLES.map((r) => {
            const isSelected = role === r;
            return (
              <TouchableOpacity
                key={r}
                onPress={() => setRole(r)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surfaceSubtle,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: isSelected ? "#FFFFFF" : colors.text,
                    fontWeight: "bold",
                    textTransform: "capitalize",
                  }}
                >
                  {r.replace("_", " ")}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Input
          label="Designation (Optional)"
          placeholder="e.g. Senior OPD Receptionist"
          value={designation}
          onChangeText={setDesignation}
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  list: {
    padding: Spacing.lg,
  },
  card: {
    marginBottom: Spacing.md,
  },
  staffRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: Typography.sizes.md,
    fontWeight: "bold",
  },
  staffRole: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: "600",
    marginTop: 2,
  },
  staffContact: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  actionsCol: {
    alignItems: "flex-end",
  },
  delBtn: {
    marginTop: Spacing.sm,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.xs,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: Spacing.md,
  },
  chip: {
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
});

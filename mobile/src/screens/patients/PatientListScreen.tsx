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
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { useTheme } from "../../hooks/useTheme";
import { usePatientSearch } from "../../hooks/usePatients";
import { Header } from "../../components/ui/Header";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { CardSkeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { Patient } from "../../types/patient";
import { Spacing, Typography, BorderRadius } from "../../constants/layout";

type PatientNavProp = NativeStackNavigationProp<RootStackParamList>;

export const PatientListScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<PatientNavProp>();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: patients = [], isLoading, refetch } = usePatientSearch(searchQuery);

  const renderPatientCard = ({ item }: { item: Patient }) => {
    return (
      <Card
        onPress={() => navigation.navigate("PatientDetail", { patientId: item._id })}
        style={styles.card}
      >
        <View style={styles.cardRow}>
          {/* Avatar / Initial circle */}
          <View style={[styles.avatarCircle, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.avatarInitial, { color: colors.primary }]}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>

          {/* Demographics */}
          <View style={styles.patientInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
              {item.blood_group && item.blood_group !== "unknown" && (
                <Badge
                  label={item.blood_group}
                  variant="danger"
                  size="sm"
                  style={{ marginLeft: Spacing.xs }}
                />
              )}
            </View>

            <Text style={[styles.meta, { color: colors.textSecondary }]}>
              📱 {item.phone} • UHID: {item.uhid}
            </Text>

            <Text style={[styles.subMeta, { color: colors.textMuted }]}>
              {item.gender.toUpperCase()} • {item.age_years ? `${item.age_years} yrs` : "Age N/A"} •{" "}
              {item.total_visits || 1} Visits
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header
        title="Patients Directory"
        subtitle="Electronic Health Records"
        rightAction={
          <Button
            title="+ New Patient"
            size="sm"
            onPress={() => navigation.navigate("AddPatient")}
          />
        }
      />

      <View style={styles.searchContainer}>
        <Input
          placeholder="Search by Patient Name, Phone or UHID..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={{ marginBottom: 0 }}
        />
      </View>

      {isLoading ? (
        <View style={styles.list}>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </View>
      ) : (
        <FlatList
          data={patients}
          keyExtractor={(item) => item._id}
          renderItem={renderPatientCard}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              title="No patients found"
              description="Search for an existing patient or register a new one."
              actionTitle="+ Register Patient"
              onAction={() => navigation.navigate("AddPatient")}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  card: {
    marginBottom: Spacing.md,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  avatarInitial: {
    fontSize: Typography.sizes.lg,
    fontWeight: "bold",
  },
  patientInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  meta: {
    fontSize: Typography.sizes.xs + 1,
    marginTop: 2,
  },
  subMeta: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
});

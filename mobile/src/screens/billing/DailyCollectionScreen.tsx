import React from "react";
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
import { useDailyCollection } from "../../hooks/useInvoices";
import { Header } from "../../components/ui/Header";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { Invoice } from "../../types/invoice";
import { Spacing, Typography, BorderRadius } from "../../constants/layout";

type BillingNavProp = NativeStackNavigationProp<RootStackParamList>;

export const DailyCollectionScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<BillingNavProp>();
  const { data, isLoading, refetch } = useDailyCollection();

  const summary = data?.summary || {
    total_invoices: 0,
    total_billed: 0,
    total_collected: 0,
    pending_amount: 0,
    payment_methods_breakdown: {},
  };
  const invoices = data?.invoices || [];

  const renderInvoice = ({ item }: { item: Invoice }) => {
    const isPaid = item.payment_status === "paid";

    return (
      <Card style={styles.card}>
        <View style={styles.invoiceHeader}>
          <View>
            <Text style={[styles.invoiceNum, { color: colors.primary }]}>
              #{item.invoice_number}
            </Text>
            <Text style={[styles.patientName, { color: colors.text }]}>
              {item.patient_id?.name || "Patient"}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={[styles.amountText, { color: colors.text }]}>
              ₹{item.total_payable}
            </Text>
            <Badge
              label={item.payment_status.toUpperCase()}
              variant={isPaid ? "success" : "warning"}
              size="sm"
            />
          </View>
        </View>

        <View style={styles.invoiceMeta}>
          <Text style={[styles.metaText, { color: colors.textMuted }]}>
            Payment Mode: <Text style={{ textTransform: "uppercase", fontWeight: "600" }}>{item.payment_method}</Text>
          </Text>
          <Text style={[styles.metaText, { color: colors.textMuted }]}>
            Items: {item.items?.length || 1}
          </Text>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header
        title="Billing & Daily Collection"
        subtitle="Practice Financial Overview"
        rightAction={
          <Button
            title="+ Invoice"
            size="sm"
            onPress={() => navigation.navigate("CreateInvoice", {})}
          />
        }
      />

      {/* KPI Financial Cards */}
      <View style={styles.summaryContainer}>
        <Card style={[styles.kpiCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.kpiCardLabel}>Total Collected Today</Text>
          <Text style={styles.kpiCardValue}>₹{summary.total_collected.toLocaleString("en-IN")}</Text>
          <Text style={styles.kpiCardSub}>From {summary.total_invoices} Invoices</Text>
        </Card>

        <View style={styles.statsRow}>
          <Card style={[styles.miniStatCard, { flex: 0.48 }]}>
            <Text style={[styles.miniLabel, { color: colors.textMuted }]}>Total Billed</Text>
            <Text style={[styles.miniValue, { color: colors.text }]}>
              ₹{summary.total_billed.toLocaleString("en-IN")}
            </Text>
          </Card>

          <Card style={[styles.miniStatCard, { flex: 0.48 }]}>
            <Text style={[styles.miniLabel, { color: colors.textMuted }]}>Outstanding</Text>
            <Text style={[styles.miniValue, { color: colors.danger }]}>
              ₹{summary.pending_amount.toLocaleString("en-IN")}
            </Text>
          </Card>
        </View>
      </View>

      {/* Invoices List */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Today's Invoices</Text>

      {isLoading ? (
        <View style={{ padding: Spacing.lg }}>
          <Skeleton height={80} borderRadius={16} />
          <Skeleton height={80} borderRadius={16} style={{ marginTop: Spacing.md }} />
        </View>
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(item) => item._id}
          renderItem={renderInvoice}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              title="No invoices recorded today"
              description="Create an invoice for consultations or clinical procedures."
              actionTitle="+ Generate Invoice"
              onAction={() => navigation.navigate("CreateInvoice", {})}
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
  summaryContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  kpiCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  kpiCardLabel: {
    color: "#E0F2FE",
    fontSize: Typography.sizes.xs,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  kpiCardValue: {
    color: "#FFFFFF",
    fontSize: Typography.sizes.display,
    fontWeight: Typography.weights.heavy,
    marginTop: 4,
  },
  kpiCardSub: {
    color: "#CCFBF1",
    fontSize: Typography.sizes.xs,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  miniStatCard: {
    padding: Spacing.md,
  },
  miniLabel: {
    fontSize: Typography.sizes.xs,
  },
  miniValue: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: "bold",
    textTransform: "uppercase",
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  list: {
    padding: Spacing.lg,
  },
  card: {
    marginBottom: Spacing.md,
  },
  invoiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  invoiceNum: {
    fontSize: Typography.sizes.xs,
    fontWeight: "bold",
  },
  patientName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    marginTop: 2,
  },
  amountText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.heavy,
    marginBottom: 2,
  },
  invoiceMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  metaText: {
    fontSize: Typography.sizes.xs,
  },
});

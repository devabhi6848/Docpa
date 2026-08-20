import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/types";
import { useTheme } from "../../hooks/useTheme";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import { useCreateInvoice } from "../../hooks/useInvoices";
import { usePatientSearch } from "../../hooks/usePatients";
import { Header } from "../../components/ui/Header";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { InvoiceItem, PaymentMethod, PaymentStatus } from "../../types/invoice";
import { Patient } from "../../types/patient";
import { Spacing, Typography, BorderRadius } from "../../constants/layout";

type CreateInvoiceRouteProp = RouteProp<RootStackParamList, "CreateInvoice">;

const PAYMENT_METHODS: PaymentMethod[] = ["cash", "upi", "card", "net_banking"];

export const CreateInvoiceScreen: React.FC = () => {
  const { colors } = useTheme();
  const route = useRoute<CreateInvoiceRouteProp>();
  const navigation = useNavigation();
  const { token, patientId: passedPatientId } = route.params || {};

  const activeClinic = useAuthStore((state) => state.activeClinic);
  const showToast = useUIStore((state) => state.showToast);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(
    (token?.patient_id as Patient) || null
  );

  const { data: searchResults = [] } = usePatientSearch(searchQuery);
  const createInvoiceMutation = useCreateInvoice();

  // Invoice Line Items
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      name: "Doctor Consultation Fee",
      category: "consultation",
      quantity: 1,
      unit_price: activeClinic?.consultation_fee || 500,
      total_amount: activeClinic?.consultation_fee || 500,
    },
  ]);

  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [discountAmount, setDiscountAmount] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("paid");
  const [txnRef, setTxnRef] = useState("");

  const subtotal = items.reduce((acc, it) => acc + it.total_amount, 0);
  const discount = parseFloat(discountAmount) || 0;
  const totalPayable = Math.max(0, subtotal - discount);

  const handleAddItem = () => {
    if (!newItemName.trim() || !newItemPrice) return;
    const price = parseFloat(newItemPrice) || 0;
    setItems((prev) => [
      ...prev,
      {
        name: newItemName.trim(),
        category: "other",
        quantity: 1,
        unit_price: price,
        total_amount: price,
      },
    ]);
    setNewItemName("");
    setNewItemPrice("");
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreate = () => {
    if (!activeClinic) {
      showToast("Please select an active clinic", "warning");
      return;
    }
    const patientId = selectedPatient?._id || passedPatientId;
    if (!patientId) {
      showToast("Please select a patient for the invoice", "warning");
      return;
    }
    if (items.length === 0) {
      showToast("Please add at least one line item", "warning");
      return;
    }

    createInvoiceMutation.mutate(
      {
        clinic_id: activeClinic._id,
        patient_id: patientId,
        appointment_id: token?._id,
        items,
        subtotal,
        discount_amount: discount,
        tax_amount: 0,
        total_payable: totalPayable,
        paid_amount: paymentStatus === "paid" ? totalPayable : 0,
        payment_status: paymentStatus,
        payment_method: paymentMethod,
        transaction_reference: txnRef.trim() || undefined,
      },
      {
        onSuccess: () => {
          navigation.goBack();
        },
      }
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title="Generate Invoice" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Patient Selection */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Patient Information</Text>
          {selectedPatient ? (
            <View style={[styles.selectedBox, { backgroundColor: colors.surfaceSubtle }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: colors.text }]}>{selectedPatient.name}</Text>
                <Text style={[styles.sub, { color: colors.textMuted }]}>
                  Phone: {selectedPatient.phone} • UHID: {selectedPatient.uhid}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedPatient(null)}>
                <Text style={{ color: colors.danger, fontWeight: "bold" }}>Change</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Input
                label="Search Patient"
                placeholder="Type name or phone..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && searchResults.length > 0 && (
                <View style={styles.resultsBox}>
                  {searchResults.map((p: Patient) => (
                    <TouchableOpacity
                      key={p._id}
                      onPress={() => {
                        setSelectedPatient(p);
                        setSearchQuery("");
                      }}
                      style={styles.resultItem}
                    >
                      <Text style={[styles.resName, { color: colors.text }]}>{p.name}</Text>
                      <Text style={[styles.resMeta, { color: colors.textMuted }]}>{p.phone}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}
        </Card>

        {/* Billable Items */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Billing Items</Text>

          {items.map((it, index) => (
            <View key={index} style={[styles.itemRow, { borderBottomColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemName, { color: colors.text }]}>{it.name}</Text>
                <Text style={[styles.itemMeta, { color: colors.textMuted }]}>
                  Qty: {it.quantity} × ₹{it.unit_price}
                </Text>
              </View>
              <Text style={[styles.itemTotal, { color: colors.primary }]}>₹{it.total_amount}</Text>
              <TouchableOpacity onPress={() => handleRemoveItem(index)} style={styles.removeBtn}>
                <Text style={{ color: colors.danger, fontWeight: "bold" }}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Add custom item inputs */}
          <View style={styles.addItemBox}>
            <Input
              placeholder="Item Name (e.g. ECG, Dressing)"
              value={newItemName}
              onChangeText={setNewItemName}
              containerStyle={{ flex: 1, marginRight: Spacing.sm, marginBottom: 0 }}
            />
            <Input
              placeholder="Price ₹"
              keyboardType="numeric"
              value={newItemPrice}
              onChangeText={setNewItemPrice}
              containerStyle={{ width: 90, marginRight: Spacing.sm, marginBottom: 0 }}
            />
            <Button title="+ Add" size="sm" onPress={handleAddItem} />
          </View>
        </Card>

        {/* Payment & Totals */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment & Summary</Text>

          <Input
            label="Discount (₹)"
            placeholder="0"
            keyboardType="numeric"
            value={discountAmount}
            onChangeText={setDiscountAmount}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Payment Method</Text>
          <View style={styles.methodRow}>
            {PAYMENT_METHODS.map((m) => {
              const isSelected = paymentMethod === m;
              return (
                <TouchableOpacity
                  key={m}
                  onPress={() => setPaymentMethod(m)}
                  style={[
                    styles.methodChip,
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
                      textTransform: "uppercase",
                      fontSize: Typography.sizes.xs,
                    }}
                  >
                    {m}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Input
            label="Transaction Ref / UPI UTR (Optional)"
            placeholder="e.g. UPI-123456789"
            value={txnRef}
            onChangeText={setTxnRef}
            containerStyle={{ marginTop: Spacing.sm }}
          />

          {/* Totals Summary */}
          <View style={[styles.totalBox, { backgroundColor: colors.surfaceSubtle }]}>
            <View style={styles.calcRow}>
              <Text style={{ color: colors.textSecondary }}>Subtotal:</Text>
              <Text style={{ color: colors.text, fontWeight: "bold" }}>₹{subtotal}</Text>
            </View>
            <View style={styles.calcRow}>
              <Text style={{ color: colors.textSecondary }}>Discount:</Text>
              <Text style={{ color: colors.danger }}>-₹{discount}</Text>
            </View>
            <View style={[styles.calcRow, styles.finalRow]}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total Amount Payable:</Text>
              <Text style={[styles.totalAmount, { color: colors.primary }]}>₹{totalPayable}</Text>
            </View>
          </View>
        </Card>

        <Button
          title={`Generate Invoice (₹${totalPayable})`}
          onPress={handleCreate}
          isLoading={createInvoiceMutation.isPending}
          disabled={!selectedPatient}
          size="lg"
          style={styles.submitBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  card: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.md,
  },
  selectedBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  name: {
    fontSize: Typography.sizes.md,
    fontWeight: "bold",
  },
  sub: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  resultsBox: {
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  resultItem: {
    paddingVertical: Spacing.xs + 2,
  },
  resName: {
    fontSize: Typography.sizes.sm,
    fontWeight: "bold",
  },
  resMeta: {
    fontSize: Typography.sizes.xs,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  itemName: {
    fontSize: Typography.sizes.sm,
    fontWeight: "600",
  },
  itemMeta: {
    fontSize: Typography.sizes.xs,
  },
  itemTotal: {
    fontSize: Typography.sizes.md,
    fontWeight: "bold",
    marginRight: Spacing.sm,
  },
  removeBtn: {
    padding: Spacing.xs,
  },
  addItemBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.md,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.xs,
  },
  methodRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: Spacing.sm,
  },
  methodChip: {
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  totalBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  calcRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  finalRow: {
    borderTopWidth: 1,
    borderTopColor: "#CBD5E1",
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  totalLabel: {
    fontSize: Typography.sizes.md,
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.heavy,
  },
  submitBtn: {
    marginBottom: Spacing.xxl,
  },
});

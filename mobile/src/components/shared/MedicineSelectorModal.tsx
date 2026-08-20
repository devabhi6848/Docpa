import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from "react-native";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { useMedicineSearch } from "../../hooks/usePrescriptions";
import { PrescribedMedicine } from "../../types/prescription";
import { Medicine } from "../../types/medicine";
import { Spacing, Typography, BorderRadius } from "../../constants/layout";
import { useTheme } from "../../hooks/useTheme";

interface MedicineSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onAddMedicine: (medicine: PrescribedMedicine) => void;
}

const FREQUENCY_PRESETS = ["1-0-1", "1-0-0", "0-0-1", "1-1-1", "1-1-1-1", "SOS", "Once Daily"];
const TIMING_PRESETS = ["After Food", "Before Food", "With Food", "Empty Stomach", "At Bedtime"];

export const MedicineSelectorModal: React.FC<MedicineSelectorModalProps> = ({
  visible,
  onClose,
  onAddMedicine,
}) => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: searchResults = [], isLoading } = useMedicineSearch(searchQuery);

  // Form state
  const [name, setName] = useState("");
  const [genericName, setGenericName] = useState("");
  const [dosageForm, setDosageForm] = useState("Tablet");
  const [dose, setDose] = useState("1 Tab");
  const [frequency, setFrequency] = useState("1-0-1");
  const [timing, setTiming] = useState("After Food");
  const [durationDays, setDurationDays] = useState("5");
  const [instructions, setInstructions] = useState("");

  const handleSelectDrugFromMaster = (item: Medicine) => {
    setName(item.name);
    setGenericName(item.generic_name || "");
    setDosageForm(item.dosage_form || "Tablet");
    setFrequency(item.default_frequency || "1-0-1");
    setTiming(item.default_timing || "After Food");
    setDurationDays(item.default_duration_days?.toString() || "5");
    setInstructions(item.instructions || "");
    setSearchQuery("");
  };

  const handleAdd = () => {
    if (!name.trim()) return;

    onAddMedicine({
      name: name.trim(),
      generic_name: genericName.trim(),
      dosage_form: dosageForm,
      dose: dose.trim(),
      frequency,
      timing,
      duration_days: parseInt(durationDays, 10) || 5,
      instructions: instructions.trim(),
    });

    // Reset & Close
    setName("");
    setGenericName("");
    setDose("1 Tab");
    setFrequency("1-0-1");
    setTiming("After Food");
    setDurationDays("5");
    setInstructions("");
    setSearchQuery("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Add Prescribed Medicine"
      footer={
        <Button
          title="Add to Prescription"
          onPress={handleAdd}
          disabled={!name.trim()}
        />
      }
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Drug Master Search Input */}
        <Input
          label="Search Drug Database / Generic Name"
          placeholder="e.g. Paracetamol, Augmentin, Pantocid..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {searchQuery.length >= 2 && searchResults.length > 0 && (
          <View style={[styles.suggestionsBox, { backgroundColor: colors.surfaceSubtle }]}>
            {searchResults.map((item: Medicine) => (
              <TouchableOpacity
                key={item._id}
                onPress={() => handleSelectDrugFromMaster(item)}
                style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
              >
                <Text style={[styles.suggestionName, { color: colors.text }]}>
                  {item.name} ({item.dosage_form})
                </Text>
                {item.generic_name ? (
                  <Text style={[styles.suggestionGeneric, { color: colors.textMuted }]}>
                    {item.generic_name}
                  </Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Selected Drug Fields */}
        <Input
          label="Medicine Name *"
          placeholder="Medicine Brand Name"
          value={name}
          onChangeText={setName}
        />

        <Input
          label="Generic / Salt Composition"
          placeholder="e.g. Amoxicillin + Clavulanic Acid"
          value={genericName}
          onChangeText={setGenericName}
        />

        <View style={styles.row}>
          <Input
            label="Dosage Form"
            placeholder="Tablet"
            value={dosageForm}
            onChangeText={setDosageForm}
            containerStyle={styles.halfInput}
          />
          <Input
            label="Dose"
            placeholder="1 Tab / 5 ml"
            value={dose}
            onChangeText={setDose}
            containerStyle={styles.halfInput}
          />
        </View>

        {/* Frequency Chips */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>Frequency *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {FREQUENCY_PRESETS.map((freq) => {
            const isSelected = frequency === freq;
            return (
              <TouchableOpacity
                key={freq}
                onPress={() => setFrequency(freq)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surfaceSubtle,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={{ color: isSelected ? "#FFFFFF" : colors.text, fontWeight: "600" }}>
                  {freq}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Timing Chips */}
        <Text style={[styles.label, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
          Timing
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {TIMING_PRESETS.map((t) => {
            const isSelected = timing === t;
            return (
              <TouchableOpacity
                key={t}
                onPress={() => setTiming(t)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surfaceSubtle,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={{ color: isSelected ? "#FFFFFF" : colors.text, fontWeight: "600" }}>
                  {t}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Input
          label="Duration (Days)"
          placeholder="5"
          keyboardType="numeric"
          value={durationDays}
          onChangeText={setDurationDays}
          containerStyle={{ marginTop: Spacing.sm }}
        />

        <Input
          label="Special Instructions"
          placeholder="e.g. Take with warm water, avoid dairy"
          value={instructions}
          onChangeText={setInstructions}
        />
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  suggestionsBox: {
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    maxHeight: 180,
  },
  suggestionItem: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  suggestionName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  suggestionGeneric: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    flex: 0.48,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.xs,
  },
  chipsScroll: {
    marginBottom: Spacing.sm,
  },
  chip: {
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    marginRight: Spacing.xs,
  },
});

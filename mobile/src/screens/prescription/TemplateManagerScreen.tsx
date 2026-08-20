import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { useDoctorTemplates, useCreateTemplate } from "../../hooks/usePrescriptions";
import { Header } from "../../components/ui/Header";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { EmptyState } from "../../components/ui/EmptyState";
import { RxTemplate } from "../../types/template";
import { Spacing, Typography, BorderRadius } from "../../constants/layout";

export const TemplateManagerScreen: React.FC = () => {
  const { colors } = useTheme();
  const { data: templates = [], isLoading } = useDoctorTemplates();
  const createTemplateMutation = useCreateTemplate();

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [specialization, setSpecialization] = useState("General Medicine");
  const [diagnosis, setDiagnosis] = useState("");
  const [advice, setAdvice] = useState("");

  const handleSave = () => {
    if (!title.trim()) return;

    createTemplateMutation.mutate(
      {
        title: title.trim(),
        specialization: specialization.trim(),
        diagnosis: diagnosis ? diagnosis.split(",").map((s) => s.trim()) : [],
        advice: advice.trim(),
        medicines: [],
        chief_complaints: [],
        investigations: [],
      },
      {
        onSuccess: () => {
          setTitle("");
          setDiagnosis("");
          setAdvice("");
          setShowModal(false);
        },
      }
    );
  };

  const renderTemplate = ({ item }: { item: RxTemplate }) => {
    return (
      <Card style={styles.card}>
        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.spec, { color: colors.primary }]}>{item.specialization}</Text>
        {item.diagnosis?.length > 0 && (
          <Text style={[styles.meta, { color: colors.textSecondary }]}>
            Diagnosis: {item.diagnosis.join(", ")}
          </Text>
        )}
        {item.medicines?.length > 0 && (
          <Text style={[styles.meta, { color: colors.textMuted }]}>
            Includes {item.medicines.length} Pre-configured medicines
          </Text>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header
        title="Prescription Templates"
        showBack
        subtitle="1-Click Rx Presets"
        rightAction={
          <Button
            title="+ New Template"
            size="sm"
            onPress={() => setShowModal(true)}
          />
        }
      />

      <FlatList
        data={templates}
        keyExtractor={(item) => item._id}
        renderItem={renderTemplate}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            title="No Rx Templates created"
            description="Create reusable clinical templates to issue prescriptions in seconds."
            actionTitle="+ Create Template"
            onAction={() => setShowModal(true)}
          />
        }
      />

      <Modal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title="Create Prescription Template"
        footer={
          <Button
            title="Save Template"
            onPress={handleSave}
            isLoading={createTemplateMutation.isPending}
            disabled={!title.trim()}
          />
        }
      >
        <Input
          label="Template Title *"
          placeholder="e.g. Acute Bronchitis Protocol, Typhoid Rx"
          value={title}
          onChangeText={setTitle}
        />

        <Input
          label="Medical Specialization"
          placeholder="e.g. General Medicine, Pediatrics"
          value={specialization}
          onChangeText={setSpecialization}
        />

        <Input
          label="Common Diagnosis Tags"
          placeholder="e.g. Acute Bronchitis, Fever"
          value={diagnosis}
          onChangeText={setDiagnosis}
        />

        <Input
          label="Standard Lifestyle / Dietary Advice"
          placeholder="e.g. Steam inhalation 3x daily, stay hydrated"
          value={advice}
          onChangeText={setAdvice}
          multiline
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
  title: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  spec: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: "600",
    marginTop: 2,
  },
  meta: {
    fontSize: Typography.sizes.xs,
    marginTop: 4,
  },
});

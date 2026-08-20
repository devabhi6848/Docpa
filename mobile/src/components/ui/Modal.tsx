import React from "react";
import {
  Modal as RNModal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { BorderRadius, Spacing, Typography } from "../../constants/layout";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  footer,
}) => {
  const { colors } = useTheme();

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={styles.keyboardView}
            >
              <View
                style={[
                  styles.modalContent,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.divider }]}>
                  {title ? (
                    <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                  ) : (
                    <View />
                  )}
                  <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                    <Text style={{ color: colors.textMuted, fontSize: 20, fontWeight: "600" }}>
                      ✕
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Body */}
                <ScrollView
                  style={styles.body}
                  contentContainerStyle={styles.bodyContent}
                  showsVerticalScrollIndicator={false}
                >
                  {children}
                </ScrollView>

                {/* Footer */}
                {footer && (
                  <View style={[styles.footer, { borderTopColor: colors.divider }]}>
                    {footer}
                  </View>
                )}
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  keyboardView: {
    width: "100%",
  },
  modalContent: {
    width: "100%",
    maxHeight: "90%",
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  body: {
    maxHeight: 480,
  },
  bodyContent: {
    padding: Spacing.lg,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { ModalSheet } from './ModalSheet';
import { Eye, EyeOff, Plus, Trash2, Key, Lock, Check } from 'lucide-react-native';

export interface EnvVarItem {
  key: string;
  value: string;
}

interface EnvVarsModalProps {
  visible: boolean;
  onClose: () => void;
  projectName: string;
  envVars: EnvVarItem[];
  onSaveEnvVars: (envVars: EnvVarItem[]) => void;
}

export const EnvVarsModal: React.FC<EnvVarsModalProps> = ({
  visible,
  onClose,
  projectName,
  envVars = [],
  onSaveEnvVars,
}) => {
  const [items, setItems] = useState<EnvVarItem[]>(
    envVars.length > 0
      ? envVars
      : [
          { key: 'DATABASE_URL', value: 'postgresql://admin:secret@db:5432/main' },
          { key: 'PORT', value: '8080' },
          { key: 'JWT_SECRET', value: 'super-secret-key-32-chars-long' },
        ]
  );
  const [revealedKeys, setRevealedKeys] = useState<{ [key: number]: boolean }>({});
  const [saved, setSaved] = useState(false);

  const toggleReveal = (index: number) => {
    setRevealedKeys((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleUpdate = (index: number, field: 'key' | 'value', text: string) => {
    const next = [...items];
    next[index][field] = text;
    setItems(next);
  };

  const handleAdd = () => {
    setItems([...items, { key: '', value: '' }]);
  };

  const handleRemove = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSaveEnvVars(items.filter((i) => i.key.trim() !== ''));
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      title="Environment Variables"
      subtitle={`Encrypted AES-256 secrets for ${projectName}`}
    >
      <View style={styles.banner}>
        <Lock size={13} color={colors.primary} />
        <Text style={styles.bannerText}>
          Variables are encrypted at rest and securely injected into the container at runtime.
        </Text>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {items.map((item, idx) => {
          const isRevealed = revealedKeys[idx];

          return (
            <View key={idx} style={styles.varRow}>
              <View style={styles.inputCol}>
                <TextInput
                  style={styles.keyInput}
                  placeholder="VARIABLE_NAME"
                  placeholderTextColor={colors.textMuted}
                  value={item.key}
                  onChangeText={(text) => handleUpdate(idx, 'key', text)}
                  autoCapitalize="characters"
                />
                <View style={styles.valueRow}>
                  <TextInput
                    style={styles.valueInput}
                    placeholder="variable value"
                    placeholderTextColor={colors.textMuted}
                    value={item.value}
                    secureTextEntry={!isRevealed}
                    onChangeText={(text) => handleUpdate(idx, 'value', text)}
                  />
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => toggleReveal(idx)}
                    style={styles.iconBtn}
                  >
                    {isRevealed ? (
                      <EyeOff size={14} color={colors.textSecondary} />
                    ) : (
                      <Eye size={14} color={colors.textMuted} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleRemove(idx)}
                style={styles.deleteBtn}
              >
                <Trash2 size={15} color={colors.error} />
              </TouchableOpacity>
            </View>
          );
        })}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleAdd}
          style={styles.addBtn}
        >
          <Plus size={14} color={colors.primary} />
          <Text style={styles.addBtnText}>Add Variable</Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleSave}
        style={styles.saveBtn}
      >
        {saved ? (
          <>
            <Check size={16} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>Saved & Encrypted</Text>
          </>
        ) : (
          <>
            <Lock size={16} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>Save & Apply Variables</Text>
          </>
        )}
      </TouchableOpacity>
    </ModalSheet>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  bannerText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },
  list: {
    maxHeight: 320,
    marginBottom: 16,
  },
  varRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 10,
    gap: 8,
  },
  inputCol: {
    flex: 1,
    gap: 6,
  },
  keyInput: {
    ...typography.mono,
    color: colors.primary,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 11.5,
    fontWeight: '700',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  valueInput: {
    ...typography.mono,
    color: colors.textPrimary,
    flex: 1,
    paddingVertical: 6,
    fontSize: 11.5,
  },
  iconBtn: {
    padding: 4,
  },
  deleteBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.errorBg,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
    marginTop: 4,
  },
  addBtnText: {
    ...typography.badge,
    color: colors.primary,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
  },
  saveBtnText: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

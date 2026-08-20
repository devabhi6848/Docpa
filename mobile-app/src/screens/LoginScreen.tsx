import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { api } from '../services/api';
import { User } from '../types';
import { Stethoscope, Mail, Lock, LogIn, ShieldCheck } from 'lucide-react-native';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('doctor@docpa.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      const res = await api.login(email, password);
      onLoginSuccess(res.user);
    } catch (e) {
      console.log('Login error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        {/* Brand Icon */}
        <View style={styles.brandIcon}>
          <Stethoscope size={36} color={colors.primary} />
        </View>

        <Text style={styles.brandTitle}>DOCPA</Text>
        <Text style={styles.brandTagline}>Doctor & OPD Queue Management</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Clinic Email / User ID</Text>
            <View style={styles.inputBox}>
              <Mail size={18} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="doctor@docpa.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputBox}>
              <Lock size={18} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <LogIn size={18} color="#FFFFFF" />
                <Text style={styles.loginBtnText}>Sign In to OPD Chamber</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footerNote}>
          <ShieldCheck size={14} color={colors.emerald} />
          <Text style={styles.footerText}>Secure HIPAA Compliant Authentication</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    gap: 8,
  },
  brandIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginBottom: 4,
  },
  brandTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    letterSpacing: 2,
  },
  brandTagline: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  form: {
    width: '100%',
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    gap: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    color: colors.textPrimary,
    ...typography.body,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  loginBtnText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  footerText: {
    ...typography.tiny,
    color: colors.textMuted,
  },
});

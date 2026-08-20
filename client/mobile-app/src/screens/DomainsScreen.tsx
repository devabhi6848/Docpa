import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Project, Domain } from '../types';
import { GlassCard } from '../components/common/GlassCard';
import { StatusPill } from '../components/common/StatusPill';
import { ModalSheet } from '../components/common/ModalSheet';
import { Globe, Plus, ShieldCheck, Check, RefreshCw } from 'lucide-react-native';

interface DomainsScreenProps {
  projects: Project[];
  onAddDomain: (projectId: string, domainName: string) => void;
  onVerifyDomain: (domain: Domain) => void;
  verifyingDomainId: string | null;
}

export const DomainsScreen: React.FC<DomainsScreenProps> = ({
  projects,
  onAddDomain,
  onVerifyDomain,
  verifyingDomainId,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const [domainName, setDomainName] = useState('');

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const handleAdd = () => {
    if (!domainName || !selectedProjectId) return;
    onAddDomain(selectedProjectId, domainName);
    setDomainName('');
    setIsModalOpen(false);
  };

  const allDomains = projects.flatMap((p) =>
    (p.domains || []).map((d) => ({ ...d, project: p }))
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setIsModalOpen(true)}
          style={styles.addDomainBtn}
        >
          <Plus size={16} color="#FFFFFF" />
          <Text style={styles.addDomainText}>Assign Custom Domain</Text>
        </TouchableOpacity>

        {allDomains.map((item) => {
          const isVerifying = verifyingDomainId === item.id;

          return (
            <GlassCard key={item.id} style={styles.domainCard}>
              <View style={styles.cardHeader}>
                <View style={styles.iconAndDomain}>
                  <View style={styles.domainIcon}>
                    <Globe size={18} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.domainName}>{item.domainName}</Text>
                    <Text style={styles.appText}>
                      App: <Text style={styles.appName}>{item.project.name}</Text>
                    </Text>
                  </View>
                </View>

                <StatusPill status={item.sslStatus} size="sm" />
              </View>

              <View style={styles.detailsRow}>
                <View style={styles.sslInfo}>
                  <ShieldCheck size={14} color={colors.success} />
                  <Text style={styles.sslText}>
                    {item.sslIssuer || "Let's Encrypt"} Automated TLS
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  disabled={isVerifying}
                  onPress={() => onVerifyDomain(item)}
                  style={styles.verifyBtn}
                >
                  {isVerifying ? (
                    <ActivityIndicator size="small" color={colors.textPrimary} />
                  ) : (
                    <>
                      <RefreshCw size={12} color={colors.textSecondary} />
                      <Text style={styles.verifyText}>Verify DNS</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </GlassCard>
          );
        })}
      </ScrollView>

      {/* Add Domain Modal */}
      <ModalSheet
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Custom Domain"
        subtitle="Route HTTPS traffic with Let's Encrypt auto-SSL"
      >
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>SELECT APPLICATION</Text>
          <View style={styles.projectPickerRow}>
            {projects.map((p) => {
              const isSelected = p.id === selectedProjectId;
              return (
                <TouchableOpacity
                  key={p.id}
                  activeOpacity={0.7}
                  onPress={() => setSelectedProjectId(p.id)}
                  style={[styles.projectChip, isSelected && styles.projectChipActive]}
                >
                  <Text
                    style={[
                      styles.projectChipText,
                      isSelected && styles.projectChipTextActive,
                    ]}
                  >
                    {p.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>DOMAIN NAME</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. api.yourcompany.com"
            placeholderTextColor={colors.textMuted}
            value={domainName}
            onChangeText={setDomainName}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.dnsBox}>
          <Text style={styles.dnsTitle}>DNS Configuration Record:</Text>
          <Text style={styles.dnsDetail}>
            Type: <Text style={styles.dnsValue}>A Record</Text>
          </Text>
          <Text style={styles.dnsDetail}>
            Target IP: <Text style={styles.dnsValue}>{selectedProject?.server?.host || '159.65.120.44'}</Text>
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleAdd}
          style={styles.submitBtn}
        >
          <Check size={16} color="#FFFFFF" />
          <Text style={styles.submitBtnText}>Configure SSL & Proxy</Text>
        </TouchableOpacity>
      </ModalSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
    gap: 14,
  },
  addDomainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 12,
    gap: 8,
    marginBottom: 4,
  },
  addDomainText: {
    ...typography.bodyMedium,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  domainCard: {
    marginBottom: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconAndDomain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  domainIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  domainName: {
    ...typography.mono,
    color: colors.primary,
    fontSize: 13.5,
    fontWeight: '700',
  },
  appText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  appName: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  sslInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sslText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 5,
  },
  verifyText: {
    ...typography.badge,
    color: colors.textSecondary,
    fontSize: 10,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    ...typography.badge,
    color: colors.textMuted,
    marginBottom: 6,
  },
  formInput: {
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  projectPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  projectChip: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  projectChipActive: {
    backgroundColor: colors.primaryGlow,
    borderColor: colors.primary,
  },
  projectChipText: {
    ...typography.badge,
    color: colors.textSecondary,
  },
  projectChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  dnsBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dnsTitle: {
    ...typography.badge,
    color: colors.primary,
    marginBottom: 4,
  },
  dnsDetail: {
    ...typography.mono,
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  dnsValue: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
  },
  submitBtnText: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

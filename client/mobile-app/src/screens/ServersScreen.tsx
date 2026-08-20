import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Clipboard,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Server } from '../types';
import { GlassCard } from '../components/common/GlassCard';
import { StatusPill } from '../components/common/StatusPill';
import { MetricGauge } from '../components/common/MetricGauge';
import { ModalSheet } from '../components/common/ModalSheet';
import { Server as ServerIcon, Copy, Check, Plus, Cpu, HardDrive, Layers } from 'lucide-react-native';

interface ServersScreenProps {
  servers: Server[];
  onCreateServer: (serverData: Partial<Server>) => void;
}

export const ServersScreen: React.FC<ServersScreenProps> = ({
  servers,
  onCreateServer,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [host, setHost] = useState('');

  const handleCopyKey = (key: string, id: string) => {
    Clipboard.setString(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreate = () => {
    if (!name || !host) return;
    onCreateServer({
      name,
      host,
      isOnline: true,
      cpuLoad: 4.2,
      memoryUsed: 512,
      diskUsed: 4200,
      cpuHistory: [4, 6, 5, 8, 4.2],
    });
    setName('');
    setHost('');
    setIsModalOpen(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {servers.map((server) => {
          const isKeyCopied = copiedId === server.id;

          return (
            <GlassCard key={server.id} style={styles.serverCard}>
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={styles.iconAndTitle}>
                  <View style={styles.serverIcon}>
                    <ServerIcon size={18} color={colors.secondary} />
                  </View>
                  <View style={styles.titleInfo}>
                    <Text style={styles.serverName}>{server.name}</Text>
                    <Text style={styles.hostText}>{server.host}</Text>
                  </View>
                </View>

                <StatusPill status={server.isOnline ? 'ONLINE' : 'OFFLINE'} size="sm" />
              </View>

              {/* Resource Gauges */}
              <View style={styles.gaugesContainer}>
                <MetricGauge
                  label="CPU Load"
                  value={server.cpuLoad || 0}
                  unit="%"
                  color={colors.primary}
                />
                <MetricGauge
                  label="Memory Allocated"
                  value={server.memoryUsed || 0}
                  unit=" MB"
                  max={4096}
                  color={colors.purple}
                />
                <MetricGauge
                  label="Disk Storage"
                  value={parseFloat(((server.diskUsed || 0) / 1024).toFixed(1))}
                  unit=" GB"
                  max={50}
                  color={colors.warning}
                />
              </View>

              {/* Agent Key Footer */}
              <View style={styles.agentKeyContainer}>
                <Text style={styles.agentKeyLabel}>AGENT AUTH KEY</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleCopyKey(server.agentKey, server.id)}
                  style={styles.keyRow}
                >
                  <Text style={styles.keyText} numberOfLines={1}>
                    {server.agentKey}
                  </Text>
                  {isKeyCopied ? (
                    <Check size={14} color={colors.success} />
                  ) : (
                    <Copy size={14} color={colors.textMuted} />
                  )}
                </TouchableOpacity>
              </View>
            </GlassCard>
          );
        })}
      </ScrollView>

      {/* Connect Server Modal */}
      <ModalSheet
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Connect VPS Compute Node"
        subtitle="Generate unique agent credentials"
      >
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>NODE NAME</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. Frankfurt Primary Node"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>HOST IP OR DOMAIN</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. 159.65.120.44"
            placeholderTextColor={colors.textMuted}
            value={host}
            onChangeText={setHost}
          />
        </View>

        <View style={styles.instructionBox}>
          <Text style={styles.instructionTitle}>⚡ 1-Line VPS Setup Command:</Text>
          <Text style={styles.commandSnippet}>
            curl -sSL https://deploycraft.io/install.sh | bash
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleCreate}
          style={styles.submitBtn}
        >
          <Plus size={16} color="#FFFFFF" />
          <Text style={styles.submitBtnText}>Generate Node Token</Text>
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
    gap: 16,
  },
  serverCard: {
    marginBottom: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  iconAndTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  serverIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleInfo: {
    flex: 1,
  },
  serverName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  hostText: {
    ...typography.mono,
    color: colors.textMuted,
    marginTop: 2,
  },
  gaugesContainer: {
    marginTop: 14,
    gap: 8,
  },
  agentKeyContainer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  agentKeyLabel: {
    ...typography.badge,
    color: colors.textMuted,
    fontSize: 9.5,
    marginBottom: 6,
  },
  keyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  keyText: {
    ...typography.mono,
    color: colors.textSecondary,
    fontSize: 11,
    flex: 1,
    marginRight: 8,
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
  instructionBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  instructionTitle: {
    ...typography.badge,
    color: colors.primary,
    marginBottom: 4,
  },
  commandSnippet: {
    ...typography.mono,
    color: colors.terminalText,
    fontSize: 11,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
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

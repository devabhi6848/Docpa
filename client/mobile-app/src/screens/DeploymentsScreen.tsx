import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Deployment } from '../types';
import { GlassCard } from '../components/common/GlassCard';
import { StatusPill } from '../components/common/StatusPill';
import { ModalSheet } from '../components/common/ModalSheet';
import { LogTerminal } from '../components/terminal/LogTerminal';
import { GitCommit, RotateCw, Terminal, Clock, Box } from 'lucide-react-native';

interface DeploymentsScreenProps {
  deployments: Deployment[];
  onRollback: (deployment: Deployment) => void;
}

export const DeploymentsScreen: React.FC<DeploymentsScreenProps> = ({
  deployments,
  onRollback,
}) => {
  const [selectedLog, setSelectedLog] = useState<Deployment | null>(null);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {deployments.map((dep) => (
          <GlassCard key={dep.id} style={styles.deploymentCard}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <View style={styles.idGroup}>
                <Text style={styles.depId}>{dep.id}</Text>
                <Text style={styles.branchTag}>{dep.branch}</Text>
              </View>
              <StatusPill status={dep.status} size="sm" />
            </View>

            {/* Commit Message */}
            <View style={styles.commitRow}>
              <GitCommit size={14} color={colors.textMuted} />
              <Text style={styles.commitMessage} numberOfLines={2}>
                {dep.commitMessage || dep.commitHash || 'Manual deployment'}
              </Text>
            </View>

            {/* Metadata pills */}
            <View style={styles.metaRow}>
              {dep.dockerImage && (
                <View style={styles.metaItem}>
                  <Box size={12} color={colors.textMuted} />
                  <Text style={styles.metaText}>{dep.dockerImage}</Text>
                </View>
              )}

              <View style={styles.metaItem}>
                <Clock size={12} color={colors.textMuted} />
                <Text style={styles.metaText}>
                  {new Date(dep.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.cardFooter}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setSelectedLog(dep)}
                style={styles.logBtn}
              >
                <Terminal size={12} color={colors.textSecondary} />
                <Text style={styles.logBtnText}>View Logs</Text>
              </TouchableOpacity>

              {dep.dockerImage && dep.status === 'HEALTHY' && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => onRollback(dep)}
                  style={styles.rollbackBtn}
                >
                  <RotateCw size={12} color={colors.warning} />
                  <Text style={styles.rollbackText}>Restore</Text>
                </TouchableOpacity>
              )}
            </View>
          </GlassCard>
        ))}
      </ScrollView>

      {/* Terminal Log Modal */}
      <ModalSheet
        visible={selectedLog !== null}
        onClose={() => setSelectedLog(null)}
        title={`Logs: ${selectedLog?.id}`}
      >
        {selectedLog && (
          <LogTerminal
            logs={selectedLog.logs || 'No logs available.'}
            isLive={selectedLog.status === 'BUILDING' || selectedLog.status === 'DEPLOYING'}
            title={`Deployment Output (${selectedLog.id})`}
          />
        )}
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
  deploymentCard: {
    marginBottom: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  idGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  depId: {
    ...typography.mono,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  branchTag: {
    ...typography.mono,
    color: colors.textMuted,
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 10.5,
  },
  commitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  commitMessage: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 12.5,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.mono,
    color: colors.textMuted,
    fontSize: 10.5,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  logBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  logBtnText: {
    ...typography.badge,
    color: colors.textSecondary,
    fontSize: 10.5,
  },
  rollbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    gap: 5,
  },
  rollbackText: {
    ...typography.badge,
    color: colors.warning,
    fontSize: 10.5,
  },
});

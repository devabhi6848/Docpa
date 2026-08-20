import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Project, Deployment } from '../types';
import { GlassCard } from '../components/common/GlassCard';
import { StatusPill } from '../components/common/StatusPill';
import { LogTerminal } from '../components/terminal/LogTerminal';
import { EnvVarsModal, EnvVarItem } from '../components/common/EnvVarsModal';
import {
  ArrowLeft,
  GitBranch,
  Play,
  RotateCw,
  Power,
  Globe,
  Key,
  Terminal,
  Clock,
  History,
  Box,
  Layers,
} from 'lucide-react-native';

interface ProjectDetailScreenProps {
  project: Project;
  onBack: () => void;
  onTriggerDeploy: (project: Project) => void;
  onContainerAction: (project: Project, action: 'restart' | 'stop' | 'start') => void;
  onRollback: (deployment: Deployment) => void;
  deployingProjectId: string | null;
  actionInProgress: { id: string; action: string } | null;
}

export const ProjectDetailScreen: React.FC<ProjectDetailScreenProps> = ({
  project,
  onBack,
  onTriggerDeploy,
  onContainerAction,
  onRollback,
  deployingProjectId,
  actionInProgress,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'logs' | 'env' | 'deployments'>(
    'overview'
  );
  const [isEnvModalOpen, setIsEnvModalOpen] = useState(false);
  const [envVars, setEnvVars] = useState<EnvVarItem[]>([
    { key: 'DATABASE_URL', value: 'postgresql://admin:secret@159.65.120.44:5432/appdb' },
    { key: 'PORT', value: project.port.toString() },
    { key: 'JWT_SECRET', value: 'super-secret-key-32-chars-long' },
  ]);

  const latestDep = project.deployments?.[0];
  const isDeploying = deployingProjectId === project.id;
  const isActing = actionInProgress?.id === project.id;

  return (
    <View style={styles.container}>
      {/* Detail Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity activeOpacity={0.7} onPress={onBack} style={styles.backBtn}>
          <ArrowLeft size={18} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.topBarInfo}>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            {project.name}
          </Text>
          <Text style={styles.topBarSub}>{project.githubRepo}</Text>
        </View>
        {latestDep && <StatusPill status={latestDep.status} size="sm" />}
      </View>

      {/* Sub Tab Navigation */}
      <View style={styles.subTabRow}>
        {(
          [
            { key: 'overview', label: 'Overview' },
            { key: 'logs', label: 'Live Logs' },
            { key: 'deployments', label: 'History' },
            { key: 'env', label: 'Env Secrets' },
          ] as const
        ).map((tab) => {
          const isActive = activeSubTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.7}
              onPress={() => setActiveSubTab(tab.key)}
              style={[styles.subTabItem, isActive && styles.subTabItemActive]}
            >
              <Text
                style={[
                  styles.subTabLabel,
                  isActive && styles.subTabLabelActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Overview Tab Content */}
      {activeSubTab === 'overview' && (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Actions Panel */}
          <GlassCard style={styles.actionCard}>
            <Text style={styles.cardSectionTitle}>CONTAINER CONTROLS</Text>
            <View style={styles.btnRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                disabled={isActing}
                onPress={() => onContainerAction(project, 'restart')}
                style={styles.actionBtn}
              >
                <RotateCw
                  size={14}
                  color={colors.textSecondary}
                  style={isActing && actionInProgress?.action === 'restart' ? styles.spin : undefined}
                />
                <Text style={styles.actionBtnText}>Restart</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                disabled={isActing}
                onPress={() =>
                  onContainerAction(
                    project,
                    project.containerState === 'STOPPED' ? 'start' : 'stop'
                  )
                }
                style={[
                  styles.actionBtn,
                  project.containerState === 'STOPPED'
                    ? styles.btnStart
                    : styles.btnStop,
                ]}
              >
                <Power
                  size={14}
                  color={
                    project.containerState === 'STOPPED'
                      ? colors.success
                      : colors.error
                  }
                />
                <Text
                  style={[
                    styles.actionBtnText,
                    {
                      color:
                        project.containerState === 'STOPPED'
                          ? colors.success
                          : colors.error,
                    },
                  ]}
                >
                  {project.containerState === 'STOPPED' ? 'Start' : 'Stop'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                disabled={isDeploying}
                onPress={() => onTriggerDeploy(project)}
                style={styles.deployBtn}
              >
                {isDeploying ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Play size={13} color="#FFFFFF" fill="#FFFFFF" />
                    <Text style={styles.deployBtnText}>Deploy Now</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </GlassCard>

          {/* Specifications Card */}
          <GlassCard style={styles.specCard}>
            <Text style={styles.cardSectionTitle}>CONFIGURATION & SPECS</Text>

            <View style={styles.specRow}>
              <View style={styles.specIcon}>
                <GitBranch size={16} color={colors.primary} />
              </View>
              <View style={styles.specMeta}>
                <Text style={styles.specKey}>Repository Branch</Text>
                <Text style={styles.specVal}>{project.branch}</Text>
              </View>
            </View>

            <View style={styles.specRow}>
              <View style={styles.specIcon}>
                <Box size={16} color={colors.secondary} />
              </View>
              <View style={styles.specMeta}>
                <Text style={styles.specKey}>Container Port</Text>
                <Text style={styles.specVal}>:{project.port}</Text>
              </View>
            </View>

            <View style={styles.specRow}>
              <View style={styles.specIcon}>
                <Layers size={16} color={colors.purple} />
              </View>
              <View style={styles.specMeta}>
                <Text style={styles.specKey}>VPS Host Node</Text>
                <Text style={styles.specVal}>
                  {project.server?.name} ({project.server?.host})
                </Text>
              </View>
            </View>

            {project.domains && project.domains.length > 0 && (
              <View style={[styles.specRow, { borderBottomWidth: 0 }]}>
                <View style={styles.specIcon}>
                  <Globe size={16} color={colors.success} />
                </View>
                <View style={styles.specMeta}>
                  <Text style={styles.specKey}>Custom Domain</Text>
                  <Text style={[styles.specVal, { color: colors.primary }]}>
                    https://{project.domains[0].domainName}
                  </Text>
                </View>
              </View>
            )}
          </GlassCard>
        </ScrollView>
      )}

      {/* Live Logs Tab Content */}
      {activeSubTab === 'logs' && (
        <View style={styles.logContainer}>
          <LogTerminal
            logs={
              latestDep?.logs ||
              `[Connecting live stream for app-${project.name.toLowerCase()}...]\n[${new Date().toISOString()}] Server active on port ${project.port}\n`
            }
            isLive={true}
            title={`Live Stream: ${project.name}`}
          />
        </View>
      )}

      {/* Deployments Tab Content */}
      {activeSubTab === 'deployments' && (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {(project.deployments || []).map((dep) => (
            <GlassCard key={dep.id} style={styles.depCard}>
              <View style={styles.depHeader}>
                <Text style={styles.depId}>{dep.id}</Text>
                <StatusPill status={dep.status} size="sm" />
              </View>
              <Text style={styles.depMessage}>
                {dep.commitMessage || dep.commitHash || 'Manual deployment'}
              </Text>
              <View style={styles.depFooter}>
                <Text style={styles.depTime}>
                  {new Date(dep.createdAt).toLocaleString()}
                </Text>
                {dep.dockerImage && (
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
      )}

      {/* Environment Variables Tab Content */}
      {activeSubTab === 'env' && (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <GlassCard style={styles.envCard}>
            <View style={styles.envHeader}>
              <View style={styles.envTitleGroup}>
                <Key size={16} color={colors.primary} />
                <Text style={styles.envCardTitle}>Injected Secrets ({envVars.length})</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsEnvModalOpen(true)}
                style={styles.editEnvBtn}
              >
                <Text style={styles.editEnvText}>Edit Secrets</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.envList}>
              {envVars.map((v, i) => (
                <View key={i} style={styles.envRow}>
                  <Text style={styles.envKey}>{v.key}</Text>
                  <Text style={styles.envVal}>••••••••••••</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        </ScrollView>
      )}

      {/* Env Vars Editor Modal */}
      <EnvVarsModal
        visible={isEnvModalOpen}
        onClose={() => setIsEnvModalOpen(false)}
        projectName={project.name}
        envVars={envVars}
        onSaveEnvVars={setEnvVars}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarInfo: {
    flex: 1,
  },
  topBarTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  topBarSub: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  subTabRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  subTabItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  subTabItemActive: {
    borderBottomColor: colors.primary,
  },
  subTabLabel: {
    ...typography.badge,
    color: colors.textMuted,
  },
  subTabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
    gap: 16,
  },
  actionCard: {
    marginBottom: 4,
  },
  cardSectionTitle: {
    ...typography.badge,
    color: colors.textMuted,
    marginBottom: 12,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  btnStart: {
    backgroundColor: colors.successBg,
    borderColor: colors.successBorder,
  },
  btnStop: {
    backgroundColor: colors.errorBg,
    borderColor: colors.errorBorder,
  },
  actionBtnText: {
    ...typography.badge,
    color: colors.textSecondary,
  },
  deployBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
    gap: 6,
  },
  deployBtnText: {
    ...typography.badge,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  specCard: {
    marginBottom: 4,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    gap: 12,
  },
  specIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specMeta: {
    flex: 1,
  },
  specKey: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  specVal: {
    ...typography.mono,
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  logContainer: {
    flex: 1,
    padding: 16,
  },
  depCard: {
    marginBottom: 10,
  },
  depHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  depId: {
    ...typography.mono,
    color: colors.primary,
    fontWeight: '700',
  },
  depMessage: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 12.5,
    marginVertical: 8,
  },
  depFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  depTime: {
    ...typography.caption,
    color: colors.textMuted,
  },
  rollbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningBg,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  rollbackText: {
    ...typography.badge,
    color: colors.warning,
    fontSize: 10,
  },
  envCard: {
    marginBottom: 4,
  },
  envHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  envTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  envCardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  editEnvBtn: {
    backgroundColor: colors.primaryGlow,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  editEnvText: {
    ...typography.badge,
    color: colors.primary,
    fontSize: 10.5,
  },
  envList: {
    gap: 8,
  },
  envRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  envKey: {
    ...typography.mono,
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 11.5,
  },
  envVal: {
    ...typography.mono,
    color: colors.textMuted,
    fontSize: 11.5,
  },
  spin: {
    transform: [{ rotate: '180deg' }],
  },
});

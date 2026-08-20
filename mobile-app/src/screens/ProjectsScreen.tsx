import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Project, Server, Deployment } from '../types';
import { GlassCard } from '../components/common/GlassCard';
import { StatusPill } from '../components/common/StatusPill';
import { ModalSheet } from '../components/common/ModalSheet';
import { LogTerminal } from '../components/terminal/LogTerminal';
import {
  Code,
  Globe,
  Play,
  RotateCw,
  Power,
  Terminal,
  History,
  Search,
  CheckCircle,
  ChevronRight,
} from 'lucide-react-native';

interface ProjectsScreenProps {
  projects: Project[];
  servers: Server[];
  onTriggerDeploy: (project: Project) => void;
  onContainerAction: (project: Project, action: 'restart' | 'stop' | 'start') => void;
  onRollback: (deployment: Deployment) => void;
  onCreateProject: (projectData: Partial<Project>) => void;
  onSelectProject: (project: Project) => void;
  deployingProjectId: string | null;
  actionInProgress: { id: string; action: string } | null;
}

export const ProjectsScreen: React.FC<ProjectsScreenProps> = ({
  projects,
  servers,
  onTriggerDeploy,
  onContainerAction,
  onRollback,
  onCreateProject,
  onSelectProject,
  deployingProjectId,
  actionInProgress,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLogs, setSelectedLogs] = useState<{
    id: string;
    title: string;
    logs: string;
    isLive: boolean;
  } | null>(null);

  // New Project Form Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [branch, setBranch] = useState('main');
  const [port, setPort] = useState('3000');
  const [selectedServerId, setSelectedServerId] = useState(servers[0]?.id || '');
  const [autoDeploy, setAutoDeploy] = useState(true);

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.githubRepo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    if (!name || !githubRepo) return;
    onCreateProject({
      name,
      githubRepo,
      branch,
      port: parseInt(port, 10) || 3000,
      serverId: selectedServerId,
      autoDeploy,
      containerState: 'RUNNING',
    });
    setName('');
    setGithubRepo('');
    setIsModalOpen(false);
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={16} color={colors.textMuted} />
          <TextInput
            placeholder="Search applications..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredProjects.map((project) => {
          const latestDep = project.deployments?.[0];
          const isDeploying = deployingProjectId === project.id;
          const isActing = actionInProgress?.id === project.id;

          return (
            <GlassCard key={project.id} style={styles.projectCard}>
              {/* Card Header */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onSelectProject(project)}
                style={styles.cardHeader}
              >
                <View style={styles.iconAndTitle}>
                  <View style={styles.projectIcon}>
                    <Code size={18} color={colors.primary} />
                  </View>
                  <View style={styles.titleInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.projectName}>{project.name}</Text>
                      <View
                        style={[
                          styles.containerDot,
                          {
                            backgroundColor:
                              project.containerState === 'STOPPED'
                                ? colors.error
                                : colors.success,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.repoText} numberOfLines={1}>
                      {project.githubRepo} • <Text style={styles.branchTag}>{project.branch}</Text>
                    </Text>
                  </View>
                </View>

                <View style={styles.headerRight}>
                  {latestDep && <StatusPill status={latestDep.status} size="sm" />}
                  <ChevronRight size={16} color={colors.textMuted} />
                </View>
              </TouchableOpacity>

              {/* Domains Section if any */}
              {project.domains && project.domains.length > 0 && (
                <View style={styles.domainRow}>
                  <Globe size={13} color={colors.primary} />
                  <Text style={styles.domainText}>{project.domains[0].domainName}</Text>
                  <StatusPill status={project.domains[0].sslStatus} size="sm" />
                </View>
              )}

              {/* Specs Grid */}
              <View style={styles.specsContainer}>
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>PORT</Text>
                  <Text style={styles.specVal}>:{project.port}</Text>
                </View>
                <View style={styles.specDivider} />
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>NODE</Text>
                  <Text style={styles.specVal} numberOfLines={1}>
                    {project.server?.name || 'Local VPS'}
                  </Text>
                </View>
                <View style={styles.specDivider} />
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>CONTAINER</Text>
                  <Text
                    style={[
                      styles.specVal,
                      {
                        color:
                          project.containerState === 'STOPPED'
                            ? colors.error
                            : colors.success,
                      },
                    ]}
                  >
                    {project.containerState || 'RUNNING'}
                  </Text>
                </View>
              </View>

              {/* Lifecycle Controls */}
              <View style={styles.lifecycleRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  disabled={isActing}
                  onPress={() => onContainerAction(project, 'restart')}
                  style={styles.actionBtnSecondary}
                >
                  <RotateCw
                    size={13}
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
                    styles.actionBtnSecondary,
                    project.containerState === 'STOPPED'
                      ? styles.btnStart
                      : styles.btnStop,
                  ]}
                >
                  <Power
                    size={13}
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
                  activeOpacity={0.7}
                  onPress={() =>
                    setSelectedLogs({
                      id: project.id,
                      title: `Live: ${project.name}`,
                      logs: `[Connecting live Docker runtime stream for app-${project.name.toLowerCase()}...]\n[${new Date().toISOString()}] Server running on port ${project.port}\n[${new Date().toISOString()}] Database connection established pool=10\n[${new Date().toISOString()}] Ready for incoming HTTP requests.\n`,
                      isLive: true,
                    })
                  }
                  style={styles.actionBtnLive}
                >
                  <Terminal size={13} color={colors.success} />
                  <Text style={[styles.actionBtnText, { color: colors.success }]}>Live Logs</Text>
                </TouchableOpacity>
              </View>

              {/* Bottom Card Actions */}
              <View style={styles.cardFooter}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    setSelectedLogs({
                      id: latestDep?.id || project.id,
                      title: `Build Log: ${project.name}`,
                      logs: latestDep?.logs || 'No build logs recorded.',
                      isLive: false,
                    })
                  }
                  style={styles.footerLink}
                >
                  <History size={13} color={colors.textMuted} />
                  <Text style={styles.footerLinkText}>Build Log</Text>
                </TouchableOpacity>

                <View style={styles.deployBtnGroup}>
                  {latestDep?.dockerImage && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => onRollback(latestDep)}
                      style={styles.rollbackBtn}
                    >
                      <RotateCw size={12} color={colors.warning} />
                      <Text style={styles.rollbackText}>Rollback</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    activeOpacity={0.7}
                    disabled={isDeploying}
                    onPress={() => onTriggerDeploy(project)}
                    style={styles.deployBtn}
                  >
                    {isDeploying ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Play size={12} color="#FFFFFF" fill="#FFFFFF" />
                        <Text style={styles.deployText}>Deploy</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </GlassCard>
          );
        })}
      </ScrollView>

      {/* Terminal Modal Sheet */}
      <ModalSheet
        visible={selectedLogs !== null}
        onClose={() => setSelectedLogs(null)}
        title={selectedLogs?.title || 'Terminal'}
      >
        {selectedLogs && (
          <LogTerminal
            logs={selectedLogs.logs}
            isLive={selectedLogs.isLive}
            title={selectedLogs.title}
          />
        )}
      </ModalSheet>

      {/* New Project Wizard Modal */}
      <ModalSheet
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Application"
        subtitle="Configure GitHub repo and container specs"
      >
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>PROJECT NAME</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. auth-service"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>GITHUB REPOSITORY (OWNER/REPO)</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. facebook/react"
            placeholderTextColor={colors.textMuted}
            value={githubRepo}
            onChangeText={setGithubRepo}
          />
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.formLabel}>BRANCH</Text>
            <TextInput
              style={styles.formInput}
              value={branch}
              onChangeText={setBranch}
            />
          </View>
          <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.formLabel}>PORT</Text>
            <TextInput
              style={styles.formInput}
              value={port}
              keyboardType="numeric"
              onChangeText={setPort}
            />
          </View>
        </View>

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchTitle}>Auto-Deploy on Push</Text>
            <Text style={styles.switchSubtitle}>Trigger automated Docker builds</Text>
          </View>
          <Switch
            value={autoDeploy}
            onValueChange={setAutoDeploy}
            trackColor={{ false: colors.surfaceHighlight, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleCreate}
          style={styles.submitBtn}
        >
          <CheckCircle size={16} color="#FFFFFF" />
          <Text style={styles.submitBtnText}>Initialize & Deploy</Text>
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: 8,
  },
  searchInput: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    padding: 0,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
    gap: 16,
  },
  projectCard: {
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  projectIcon: {
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  projectName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  containerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  repoText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  branchTag: {
    ...typography.mono,
    color: colors.textSecondary,
  },
  domainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 12,
    gap: 8,
  },
  domainText: {
    ...typography.mono,
    color: colors.primary,
    fontSize: 11,
    flex: 1,
  },
  specsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  specItem: {
    flex: 1,
    alignItems: 'center',
  },
  specLabel: {
    ...typography.badge,
    color: colors.textMuted,
    fontSize: 9,
  },
  specVal: {
    ...typography.mono,
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 11.5,
    marginTop: 2,
  },
  specDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
  },
  lifecycleRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 10,
    paddingVertical: 8,
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
  actionBtnLive: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.successBg,
    borderRadius: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.successBorder,
    gap: 6,
  },
  actionBtnText: {
    ...typography.badge,
    color: colors.textSecondary,
    fontSize: 10.5,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  footerLinkText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  deployBtnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rollbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  rollbackText: {
    ...typography.badge,
    color: colors.warning,
    fontSize: 10.5,
  },
  deployBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 5,
  },
  deployText: {
    ...typography.badge,
    color: '#FFFFFF',
    fontSize: 11,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    marginBottom: 16,
  },
  switchTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  switchSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
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
  spin: {
    transform: [{ rotate: '180deg' }],
  },
});

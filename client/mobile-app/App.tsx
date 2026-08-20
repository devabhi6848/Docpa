import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Platform, StatusBar } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { colors } from './src/theme/colors';
import { TabType, Project, Server, Deployment, Domain } from './src/types';
import { Header } from './src/components/common/Header';
import { BottomTabBar } from './src/components/navigation/BottomTabBar';
import { ProjectsScreen } from './src/screens/ProjectsScreen';
import { ProjectDetailScreen } from './src/screens/ProjectDetailScreen';
import { ServersScreen } from './src/screens/ServersScreen';
import { TelemetryScreen } from './src/screens/TelemetryScreen';
import { DeploymentsScreen } from './src/screens/DeploymentsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { DomainsScreen } from './src/screens/DomainsScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('apps');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [apiUrl, setApiUrl] = useState('http://localhost:3000');

  // Servers State
  const [servers, setServers] = useState<Server[]>([
    {
      id: 'srv-prod-01',
      name: 'Production Node 1 (Frankfurt VPS)',
      host: '159.65.120.44',
      agentKey: 'agy_agent_9f81a7b4c2d3e5f6',
      isOnline: true,
      cpuLoad: 24.5,
      memoryUsed: 1420,
      diskUsed: 14850,
      cpuHistory: [12, 14, 19, 22, 28, 24, 21, 25, 29, 24.5],
      _count: { projects: 2 },
    },
    {
      id: 'srv-stage-01',
      name: 'Staging VPS (DigitalOcean NY)',
      host: '167.99.201.12',
      agentKey: 'agy_agent_3e2b1c4a5f6e7d8c',
      isOnline: true,
      cpuLoad: 11.2,
      memoryUsed: 890,
      diskUsed: 8200,
      cpuHistory: [8, 9, 11, 14, 10, 12, 13, 11, 10, 11.2],
      _count: { projects: 1 },
    },
  ]);

  // Projects State
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'proj-backend-api',
      name: 'production-api',
      githubRepo: 'org/backend-service',
      branch: 'main',
      port: 8080,
      autoDeploy: true,
      containerState: 'RUNNING',
      serverId: 'srv-prod-01',
      server: { name: 'Production Node 1', host: '159.65.120.44' },
      domains: [
        {
          id: 'dom-1',
          domainName: 'api.production.internal',
          sslStatus: 'ISSUED',
          sslIssuer: "Let's Encrypt",
          isPrimary: true,
        },
      ],
      deployments: [
        {
          id: 'dep-901',
          projectId: 'proj-backend-api',
          status: 'HEALTHY',
          branch: 'main',
          commitHash: '7c8b21a',
          commitMessage: 'feat: add database connection pooling and caching',
          dockerImage: 'app-backend:7c8b21a',
          containerPort: 8080,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          logs: `[${new Date().toISOString()}] Initializing deployment pipeline...\n[${new Date().toISOString()}] Cloning org/backend-service (branch: main)...\n[${new Date().toISOString()}] Building Docker image app-backend:7c8b21a...\n[${new Date().toISOString()}] Starting container on port 8080...\n[${new Date().toISOString()}] Health check passed (HTTP 200 OK).\n[${new Date().toISOString()}] Deployment SUCCESS!\n`,
        },
      ],
    },
    {
      id: 'proj-frontend-app',
      name: 'customer-portal',
      githubRepo: 'org/customer-portal-web',
      branch: 'main',
      port: 3000,
      autoDeploy: true,
      containerState: 'RUNNING',
      serverId: 'srv-prod-01',
      server: { name: 'Production Node 1', host: '159.65.120.44' },
      domains: [
        {
          id: 'dom-2',
          domainName: 'app.example.com',
          sslStatus: 'ISSUED',
          sslIssuer: "Let's Encrypt",
          isPrimary: true,
        },
      ],
      deployments: [
        {
          id: 'dep-902',
          projectId: 'proj-frontend-app',
          status: 'HEALTHY',
          branch: 'main',
          commitHash: 'a4e912f',
          commitMessage: 'fix: responsive layout for mobile navigation',
          dockerImage: 'app-frontend:a4e912f',
          containerPort: 3000,
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          logs: `[${new Date().toISOString()}] Deployment SUCCESS!\n`,
        },
      ],
    },
  ]);

  // Deployments State
  const [deployments, setDeployments] = useState<Deployment[]>([
    {
      id: 'dep-901',
      projectId: 'proj-backend-api',
      status: 'HEALTHY',
      branch: 'main',
      commitHash: '7c8b21a',
      commitMessage: 'feat: add database connection pooling and caching',
      dockerImage: 'app-backend:7c8b21a',
      containerPort: 8080,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      logs: `[${new Date().toISOString()}] Deployment SUCCESS! Container live.\n`,
    },
    {
      id: 'dep-902',
      projectId: 'proj-frontend-app',
      status: 'HEALTHY',
      branch: 'main',
      commitHash: 'a4e912f',
      commitMessage: 'fix: responsive layout for mobile navigation',
      dockerImage: 'app-frontend:a4e912f',
      containerPort: 3000,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      logs: `[${new Date().toISOString()}] Deployment SUCCESS!\n`,
    },
  ]);

  const [deployingProjectId, setDeployingProjectId] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<{ id: string; action: string } | null>(
    null
  );
  const [verifyingDomainId, setVerifyingDomainId] = useState<string | null>(null);

  // Live Telemetry Simulation (every 3 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setServers((prev) =>
        prev.map((srv) => {
          const delta = (Math.random() - 0.48) * 4;
          const nextCpu = Math.max(
            5,
            Math.min(95, parseFloat(((srv.cpuLoad || 20) + delta).toFixed(1)))
          );
          const nextHistory = [...(srv.cpuHistory || [20]).slice(-14), nextCpu];
          return {
            ...srv,
            cpuLoad: nextCpu,
            cpuHistory: nextHistory,
          };
        })
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Trigger Deployment Action
  const handleTriggerDeploy = (project: Project) => {
    setDeployingProjectId(project.id);
    const newDepId = `dep-${Math.floor(100 + Math.random() * 900)}`;
    const newDep: Deployment = {
      id: newDepId,
      projectId: project.id,
      status: 'BUILDING',
      branch: project.branch,
      commitHash: 'e49f81d',
      commitMessage: 'Manual deploy triggered from mobile app',
      containerPort: project.port,
      createdAt: new Date().toISOString(),
      logs: `[${new Date().toISOString()}] Initializing deployment pipeline on mobile...\n[${new Date().toISOString()}] Dispatching job to VPS agent on ${project.server?.name}...\n[${new Date().toISOString()}] Pulling repository https://github.com/${project.githubRepo}.git...\n[${new Date().toISOString()}] Executing 'docker build -t app-${project.name.toLowerCase()}:${newDepId} .'...\n`,
    };

    setDeployments((prev) => [newDep, ...prev]);
    setProjects((prev) =>
      prev.map((p) =>
        p.id === project.id
          ? { ...p, deployments: [newDep, ...(p.deployments || [])] }
          : p
      )
    );

    setTimeout(() => {
      setDeployments((prev) =>
        prev.map((d) =>
          d.id === newDepId
            ? {
                ...d,
                status: 'DEPLOYING',
                logs:
                  d.logs +
                  `[${new Date().toISOString()}] Docker image built successfully.\n[${new Date().toISOString()}] Starting container on port ${project.port}...\n`,
              }
            : d
        )
      );
    }, 2500);

    setTimeout(() => {
      setDeployments((prev) =>
        prev.map((d) =>
          d.id === newDepId
            ? {
                ...d,
                status: 'HEALTHY',
                dockerImage: `app-${project.name.toLowerCase()}:${newDepId}`,
                finishedAt: new Date().toISOString(),
                logs:
                  d.logs +
                  `[${new Date().toISOString()}] Health probe check passed (HTTP 200 OK).\n[${new Date().toISOString()}] Deployment SUCCESS! Container is live.\n`,
              }
            : d
        )
      );
      setDeployingProjectId(null);
    }, 5000);
  };

  // Container Lifecycle Action
  const handleContainerAction = (
    project: Project,
    action: 'restart' | 'stop' | 'start'
  ) => {
    setActionInProgress({ id: project.id, action });

    setTimeout(() => {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === project.id) {
            let nextState: Project['containerState'] = 'RUNNING';
            if (action === 'stop') nextState = 'STOPPED';
            if (action === 'restart') nextState = 'RUNNING';
            if (action === 'start') nextState = 'RUNNING';
            return { ...p, containerState: nextState };
          }
          return p;
        })
      );
      setActionInProgress(null);
    }, 1800);
  };

  // Rollback Action
  const handleRollback = (deployment: Deployment) => {
    const rollbackId = `dep-rb-${Math.floor(100 + Math.random() * 900)}`;
    const rollbackDep: Deployment = {
      id: rollbackId,
      projectId: deployment.projectId,
      status: 'DEPLOYING',
      branch: deployment.branch,
      commitHash: deployment.commitHash,
      commitMessage: `Rollback to ${deployment.dockerImage || deployment.id}`,
      dockerImage: deployment.dockerImage,
      containerPort: deployment.containerPort,
      createdAt: new Date().toISOString(),
      logs: `[${new Date().toISOString()}] INITIATING INSTANT ROLLBACK ON MOBILE...\n[${new Date().toISOString()}] Stopping active container...\n[${new Date().toISOString()}] Re-launching verified image ${deployment.dockerImage} on port ${deployment.containerPort}...\n`,
    };

    setDeployments((prev) => [rollbackDep, ...prev]);

    setTimeout(() => {
      setDeployments((prev) =>
        prev.map((d) =>
          d.id === rollbackId
            ? {
                ...d,
                status: 'ROLLED_BACK',
                finishedAt: new Date().toISOString(),
                logs:
                  d.logs +
                  `[${new Date().toISOString()}] Rollback verified! Service restored to prior healthy release.\n`,
              }
            : d
        )
      );
    }, 2800);
  };

  // Create Project Action
  const handleCreateProject = (projectData: Partial<Project>) => {
    const newProj: Project = {
      id: `proj-${Date.now().toString().slice(-4)}`,
      name: projectData.name || 'new-app',
      githubRepo: projectData.githubRepo || 'user/repo',
      branch: projectData.branch || 'main',
      port: projectData.port || 3000,
      autoDeploy: projectData.autoDeploy ?? true,
      containerState: 'RUNNING',
      serverId: projectData.serverId || servers[0]?.id || 'srv-prod-01',
      server: servers.find((s) => s.id === projectData.serverId) || servers[0],
      deployments: [],
      domains: [],
    };
    setProjects((prev) => [newProj, ...prev]);
  };

  // Create Server Action
  const handleCreateServer = (serverData: Partial<Server>) => {
    const newSrv: Server = {
      id: `srv-${Date.now().toString().slice(-4)}`,
      name: serverData.name || 'New VPS Node',
      host: serverData.host || '127.0.0.1',
      agentKey: `agy_agent_${Math.random().toString(36).substring(2, 12)}`,
      isOnline: true,
      cpuLoad: 5.4,
      memoryUsed: 512,
      diskUsed: 4200,
      cpuHistory: [5, 4, 6, 5.4],
      _count: { projects: 0 },
    };
    setServers((prev) => [...prev, newSrv]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="light" />
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Brand Header */}
      {!selectedProject && (
        <Header
          title="DeployCraft"
          subtitle="Self-Hosted VPS Engine"
          actionIcon={activeTab === 'servers' ? 'server' : 'plus'}
          onActionPress={() => {
            if (activeTab === 'servers') {
              handleCreateServer({ name: 'Frankfurt VPS 2', host: '159.65.122.90' });
            } else {
              handleCreateProject({ name: 'worker-queue', githubRepo: 'org/worker-service' });
            }
          }}
        />
      )}

      {/* Screen Content */}
      <View style={styles.contentContainer}>
        {selectedProject ? (
          <ProjectDetailScreen
            project={selectedProject}
            onBack={() => setSelectedProject(null)}
            onTriggerDeploy={handleTriggerDeploy}
            onContainerAction={handleContainerAction}
            onRollback={handleRollback}
            deployingProjectId={deployingProjectId}
            actionInProgress={actionInProgress}
          />
        ) : (
          <>
            {activeTab === 'apps' && (
              <ProjectsScreen
                projects={projects}
                servers={servers}
                onTriggerDeploy={handleTriggerDeploy}
                onContainerAction={handleContainerAction}
                onRollback={handleRollback}
                onCreateProject={handleCreateProject}
                onSelectProject={(project) => setSelectedProject(project)}
                deployingProjectId={deployingProjectId}
                actionInProgress={actionInProgress}
              />
            )}

            {activeTab === 'servers' && (
              <ServersScreen servers={servers} onCreateServer={handleCreateServer} />
            )}

            {activeTab === 'telemetry' && <TelemetryScreen servers={servers} />}

            {activeTab === 'deployments' && (
              <DeploymentsScreen
                deployments={deployments}
                onRollback={handleRollback}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsScreen apiUrl={apiUrl} onUpdateApiUrl={setApiUrl} />
            )}
          </>
        )}
      </View>

      {/* Floating Bottom Tab Bar */}
      {!selectedProject && (
        <BottomTabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          appsCount={projects.length}
          serversCount={servers.length}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  contentContainer: {
    flex: 1,
  },
});

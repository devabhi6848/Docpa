export type DeploymentStatus =
  | 'PENDING'
  | 'QUEUED'
  | 'BUILDING'
  | 'DEPLOYING'
  | 'HEALTHY'
  | 'FAILED'
  | 'ROLLED_BACK'
  | 'CANCELLED';

export type SslStatus = 'PENDING_DNS' | 'PROVISIONING' | 'ISSUED' | 'FAILED';

export type ContainerState = 'RUNNING' | 'STOPPED' | 'RESTARTING';

export interface Server {
  id: string;
  name: string;
  host: string;
  agentKey: string;
  isOnline: boolean;
  cpuLoad?: number;
  memoryUsed?: number;
  diskUsed?: number;
  cpuHistory?: number[];
  _count?: { projects: number };
}

export interface Domain {
  id: string;
  domainName: string;
  sslStatus: SslStatus;
  sslIssuer?: string;
  isPrimary?: boolean;
  projectId?: string;
}

export interface Deployment {
  id: string;
  projectId: string;
  status: DeploymentStatus;
  branch: string;
  commitHash?: string;
  commitMessage?: string;
  dockerImage?: string;
  containerPort?: number;
  logs?: string;
  errorMessage?: string;
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  githubRepo: string;
  branch: string;
  port: number;
  autoDeploy: boolean;
  serverId: string;
  containerState?: ContainerState;
  server?: { name: string; host: string };
  domains?: Domain[];
  deployments?: Deployment[];
}

export interface ServerMetric {
  id: string;
  serverId: string;
  cpuLoad: number;
  memoryUsed: number;
  diskUsed: number;
  timestamp: string;
}

export type TabType = 'apps' | 'servers' | 'telemetry' | 'deployments' | 'settings';

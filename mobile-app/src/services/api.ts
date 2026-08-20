import { Project, Server, Deployment, Domain } from '../types';

export class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  // Projects
  async getProjects(userId: string = 'demo-user-1'): Promise<Project[]> {
    try {
      const res = await fetch(`${this.baseUrl}/projects/user/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch projects');
      return await res.json();
    } catch {
      // Return local fallback state
      return [];
    }
  }

  async triggerDeploy(projectId: string): Promise<Deployment> {
    const res = await fetch(`${this.baseUrl}/deployments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId }),
    });
    return res.json();
  }

  async containerAction(projectId: string, action: 'restart' | 'stop' | 'start') {
    const res = await fetch(`${this.baseUrl}/projects/${projectId}/${action}`, {
      method: 'POST',
    });
    return res.json();
  }

  async rollbackDeployment(deploymentId: string) {
    const res = await fetch(`${this.baseUrl}/deployments/${deploymentId}/rollback`, {
      method: 'POST',
    });
    return res.json();
  }

  async addDomain(projectId: string, domainName: string) {
    const res = await fetch(`${this.baseUrl}/projects/${projectId}/domains`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domainName }),
    });
    return res.json();
  }

  async verifyDomain(domainId: string) {
    const res = await fetch(`${this.baseUrl}/projects/domains/${domainId}/verify`, {
      method: 'POST',
    });
    return res.json();
  }
}

export const api = new ApiService();

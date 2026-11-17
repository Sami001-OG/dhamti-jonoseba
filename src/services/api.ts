import { ProblemReport, ManifestoItem, LeaderProfile, ProblemStatus } from '../types';

export interface DbStatusInfo {
  connected: boolean;
  provider: string;
  mode: 'turso-cloud' | 'turso-libsql-local';
  isRemote: boolean;
  databaseUrl?: string;
  problemsCount?: number;
  manifestoCount?: number;
  error?: string;
}

export const api = {
  // Database status
  async getStatus(): Promise<DbStatusInfo | null> {
    try {
      const res = await fetch('/api/status');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // Problems
  async getProblems(): Promise<ProblemReport[]> {
    const res = await fetch('/api/problems');
    if (!res.ok) throw new Error('Failed to fetch problems from database');
    return await res.json();
  },

  async createProblem(problem: ProblemReport): Promise<ProblemReport> {
    const res = await fetch('/api/problems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(problem),
    });
    if (!res.ok) throw new Error('Failed to save problem in database');
    return await res.json();
  },

  async updateProblemStatus(
    id: string,
    status: ProblemStatus,
    noteText: string,
    officerName: string
  ): Promise<ProblemReport> {
    const res = await fetch(`/api/problems/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, noteText, officerName }),
    });
    if (!res.ok) throw new Error('Failed to update problem status in database');
    return await res.json();
  },

  async upvoteProblem(id: string, delta: number = 1): Promise<{ id: string; upvotes: number }> {
    const res = await fetch(`/api/problems/${encodeURIComponent(id)}/upvote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta }),
    });
    if (!res.ok) throw new Error('Failed to register upvote');
    return await res.json();
  },

  async deleteProblem(id: string): Promise<boolean> {
    const res = await fetch(`/api/problems/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete problem from database');
    const data = await res.json();
    return Boolean(data.success);
  },

  // Manifesto
  async getManifesto(): Promise<ManifestoItem[]> {
    const res = await fetch('/api/manifesto');
    if (!res.ok) throw new Error('Failed to fetch manifesto items');
    return await res.json();
  },

  async createManifestoItem(item: ManifestoItem): Promise<ManifestoItem> {
    const res = await fetch('/api/manifesto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to create manifesto item');
    return await res.json();
  },

  async updateManifestoItem(item: ManifestoItem): Promise<ManifestoItem> {
    const res = await fetch(`/api/manifesto/${encodeURIComponent(item.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to update manifesto item');
    return await res.json();
  },

  async deleteManifestoItem(id: string): Promise<boolean> {
    const res = await fetch(`/api/manifesto/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete manifesto item');
    const data = await res.json();
    return Boolean(data.success);
  },

  async deleteCompletedManifestos(): Promise<number> {
    const res = await fetch('/api/manifesto-completed/bulk', {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to bulk delete completed manifesto items');
    const data = await res.json();
    return Number(data.deletedCount ?? 0);
  },

  async resetManifesto(): Promise<ManifestoItem[]> {
    const res = await fetch('/api/manifesto/reset', {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to reset manifesto');
    return await res.json();
  },

  // Leader Profile
  async getProfile(): Promise<LeaderProfile> {
    const res = await fetch('/api/profile');
    if (!res.ok) throw new Error('Failed to fetch profile');
    return await res.json();
  },

  async updateProfile(profile: LeaderProfile): Promise<LeaderProfile> {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return await res.json();
  },
};

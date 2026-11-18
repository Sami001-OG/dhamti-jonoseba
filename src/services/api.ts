import { ProblemReport, ManifestoItem, LeaderProfile, ProblemStatus } from '../types';

export interface DbStatusInfo {
  connected: boolean;
  provider: string;
  mode: 'turso-cloud' | 'turso-libsql-local';
  isRemote: boolean;
  persistent?: boolean;
  databaseUrl?: string;
  problemsCount?: number;
  manifestoCount?: number;
  error?: string;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** সার্ভারের বাংলা এরর বার্তা পড়ে ApiError ছুঁড়ে দেয় */
async function ensureOk(res: Response, fallback: string): Promise<void> {
  if (res.ok) return;
  let message = fallback;
  try {
    const data = await res.json();
    if (data && typeof data.error === 'string') message = data.error;
  } catch {
    // JSON নয়, ডিফল্ট বার্তা
  }
  throw new ApiError(message, res.status);
}

const jsonHeaders = { 'Content-Type': 'application/json' };

/** ওয়ার্ড আইডি (ward-01…) → গ্রামের নাম */
export interface SiteSettings {
  wardVillages: Record<string, string>;
}

export const api = {
  // Admin auth (সার্ভার-সাইড সেশন কুকি)
  async adminSession(): Promise<{ authenticated: boolean; configured: boolean }> {
    try {
      const res = await fetch('/api/admin/session', { credentials: 'same-origin' });
      if (!res.ok) return { authenticated: false, configured: false };
      return await res.json();
    } catch {
      return { authenticated: false, configured: false };
    }
  },

  async adminLogin(password: string): Promise<void> {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      credentials: 'same-origin',
      headers: jsonHeaders,
      body: JSON.stringify({ password }),
    });
    await ensureOk(res, 'লগইন করা যায়নি।');
  },

  async adminLogout(): Promise<void> {
    try {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin' });
    } catch {
      // নেটওয়ার্ক সমস্যা হলেও স্থানীয়ভাবে লগআউট হবে
    }
  },

  // Database status
  async getStatus(): Promise<DbStatusInfo | null> {
    try {
      const res = await fetch('/api/status', { credentials: 'same-origin' });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // শুধু অ্যাডমিন: নাম ও ফোনসহ পূর্ণ তালিকা (লগইন ছাড়া 401)
  async adminGetProblems(): Promise<ProblemReport[]> {
    const res = await fetch('/api/admin/problems', { credentials: 'same-origin', cache: 'no-store' });
    await ensureOk(res, 'অ্যাডমিন তালিকা আনা যায়নি।');
    return await res.json();
  },

  // নম্বর বা ট্র্যাকিং কোড দিয়ে অভিযোগের অবস্থা। না পেলে ফাঁকা তালিকা।
  async track(query: string): Promise<ProblemReport[]> {
    const res = await fetch('/api/track', {
      method: 'POST',
      credentials: 'same-origin',
      headers: jsonHeaders,
      body: JSON.stringify({ query }),
    });
    if (res.status === 404) return [];
    await ensureOk(res, 'অনুসন্ধান করা যায়নি। আবার চেষ্টা করুন।');
    return await res.json();
  },

  // Problems
  async getProblems(): Promise<ProblemReport[]> {
    const res = await fetch('/api/problems');
    await ensureOk(res, 'সার্ভারে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    return await res.json();
  },

  async createProblem(problem: ProblemReport): Promise<ProblemReport> {
    const res = await fetch('/api/problems', {
      method: 'POST',
      credentials: 'same-origin',
      headers: jsonHeaders,
      body: JSON.stringify(problem),
    });
    await ensureOk(res, 'সার্ভারে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
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
      credentials: 'same-origin',
      headers: jsonHeaders,
      body: JSON.stringify({ status, noteText, officerName }),
    });
    await ensureOk(res, 'সার্ভারে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    return await res.json();
  },

  async upvoteProblem(id: string, delta: number = 1): Promise<{ id: string; upvotes: number }> {
    const res = await fetch(`/api/problems/${encodeURIComponent(id)}/upvote`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: jsonHeaders,
      body: JSON.stringify({ delta }),
    });
    await ensureOk(res, 'সার্ভারে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    return await res.json();
  },

  async deleteProblem(id: string): Promise<boolean> {
    const res = await fetch(`/api/problems/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    });
    await ensureOk(res, 'সার্ভারে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    const data = await res.json();
    return Boolean(data.success);
  },

  // Manifesto
  async getManifesto(): Promise<ManifestoItem[]> {
    const res = await fetch('/api/manifesto');
    await ensureOk(res, 'সার্ভারে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    return await res.json();
  },

  async createManifestoItem(item: ManifestoItem): Promise<ManifestoItem> {
    const res = await fetch('/api/manifesto', {
      method: 'POST',
      credentials: 'same-origin',
      headers: jsonHeaders,
      body: JSON.stringify(item),
    });
    await ensureOk(res, 'সার্ভারে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    return await res.json();
  },

  async updateManifestoItem(item: ManifestoItem): Promise<ManifestoItem> {
    const res = await fetch(`/api/manifesto/${encodeURIComponent(item.id)}`, {
      method: 'PUT',
      credentials: 'same-origin',
      headers: jsonHeaders,
      body: JSON.stringify(item),
    });
    await ensureOk(res, 'সার্ভারে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    return await res.json();
  },

  async deleteManifestoItem(id: string): Promise<boolean> {
    const res = await fetch(`/api/manifesto/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    });
    await ensureOk(res, 'সার্ভারে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    const data = await res.json();
    return Boolean(data.success);
  },

  async deleteCompletedManifestos(): Promise<number> {
    const res = await fetch('/api/manifesto-completed/bulk', {
      method: 'DELETE',
      credentials: 'same-origin',
    });
    await ensureOk(res, 'সার্ভারে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    const data = await res.json();
    return Number(data.deletedCount ?? 0);
  },

  async resetManifesto(): Promise<ManifestoItem[]> {
    const res = await fetch('/api/manifesto/reset', {
      method: 'POST',
      credentials: 'same-origin',
    });
    await ensureOk(res, 'সার্ভারে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    return await res.json();
  },

  // Leader Profile
  async getProfile(): Promise<LeaderProfile> {
    const res = await fetch('/api/profile');
    await ensureOk(res, 'সার্ভারে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    return await res.json();
  },

  async updateProfile(profile: LeaderProfile): Promise<LeaderProfile> {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      credentials: 'same-origin',
      headers: jsonHeaders,
      body: JSON.stringify(profile),
    });
    await ensureOk(res, 'সার্ভারে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    return await res.json();
  },

  // প্রোফাইল ছবি (শুধু অ্যাডমিন): data URL পাঠালে সার্ভার যাচাই করে সংরক্ষণ করে
  async setProfilePhoto(dataUrl: string): Promise<LeaderProfile> {
    const res = await fetch('/api/profile/photo', {
      method: 'PUT',
      credentials: 'same-origin',
      headers: jsonHeaders,
      body: JSON.stringify({ image: dataUrl }),
    });
    await ensureOk(res, 'ছবি সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।');
    return await res.json();
  },

  async resetProfilePhoto(): Promise<LeaderProfile> {
    const res = await fetch('/api/profile/photo', {
      method: 'DELETE',
      credentials: 'same-origin',
    });
    await ensureOk(res, 'ছবি বদলানো যায়নি। আবার চেষ্টা করুন।');
    return await res.json();
  },

  // সাইটের সেটিংস: ওয়ার্ডের গ্রামের নাম
  async getSettings(): Promise<SiteSettings> {
    const res = await fetch('/api/settings');
    await ensureOk(res, 'সার্ভারে সমস্যা হয়েছে।');
    return await res.json();
  },

  async updateSettings(settings: SiteSettings): Promise<SiteSettings> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      credentials: 'same-origin',
      headers: jsonHeaders,
      body: JSON.stringify(settings),
    });
    await ensureOk(res, 'সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।');
    return await res.json();
  },
};

/**
 * Express অ্যাপ (রুট, নিরাপত্তা, ভ্যালিডেশন)।
 * এটি `server.ts` (নিজের সার্ভার) এবং `api/index.ts` (Vercel) দুই জায়গা থেকেই ব্যবহার হয়।
 */
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import {
  initDatabase,
  getAllProblems,
  insertProblem,
  updateProblemStatus,
  upvoteProblem,
  deleteProblem,
  getAllManifestoItems,
  insertManifestoItem,
  updateManifestoItem,
  deleteManifestoItem,
  deleteCompletedManifestos,
  resetManifestoItems,
  getLeaderProfile,
  updateLeaderProfile,
  getDatabaseStatus,
  isDbPersistent,
} from './db.js';
import {
  isAuthConfigured,
  checkPassword,
  issueToken,
  setAdminCookie,
  clearAdminCookie,
  isAdminRequest,
  requireAdmin,
  sameOriginOnly,
  securityHeaders,
  rateLimit,
  cleanText,
  cleanPhone,
  ID_PATTERN,
} from './security.js';
import { INITIAL_MANIFESTO_ITEMS, MANIFESTO_CATEGORIES_CONFIG } from '../src/data/manifestoData.js';
import { normalizeBdMobile } from '../src/services/phone.js';
import { INITIAL_AREAS, CATEGORIES } from '../src/data/mockData.js';
import type {
  ProblemReport,
  ProblemStatus,
  UrgencyLevel,
  SubmissionType,
  ManifestoItem,
  ManifestoStatus,
  ManifestoCategory,
  LeaderProfile,
} from '../src/types/index.js';

const WARD_IDS = new Set(INITIAL_AREAS.map((a) => a.wardNumber));
const CATEGORY_IDS = new Set(CATEGORIES.map((c) => c.id));
const URGENCY: UrgencyLevel[] = ['normal', 'high', 'critical'];
const STATUSES: ProblemStatus[] = ['pending', 'reviewing', 'in_progress', 'resolved'];
const MANIFESTO_STATUSES: ManifestoStatus[] = ['planned', 'in_progress', 'completed'];
const MANIFESTO_CATEGORY_IDS = new Set(Object.keys(MANIFESTO_CATEGORIES_CONFIG));

const ANON_NAME = 'গোপন নাগরিক';
const DEFAULT_NAME = 'এলাকাবাসী';

/**
 * সবার জন্য দৃশ্যমান রূপ: নাগরিকের নাম ও ফোন নম্বর কখনোই বের হয় না।
 * আসল নাম-নম্বর শুধু অ্যাডমিন (GET /api/admin/problems) দেখতে পায়।
 */
function toPublic(problem: ProblemReport): ProblemReport {
  return { ...problem, phone: '', citizenName: DEFAULT_NAME };
}

type NewProblemInput = {
  submissionType: SubmissionType;
  title: string;
  description: string;
  category: string;
  ward: string;
  specificLocation: string;
  citizenName: string;
  phone: string;
  isAnonymous: boolean;
  urgency: UrgencyLevel;
};

function parseNewProblem(body: any): { ok: true; value: NewProblemInput } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'তথ্য সঠিক নয়।' };

  const submissionType: SubmissionType = body.submissionType === 'advice' ? 'advice' : 'complaint';
  const title = cleanText(body.title, 120);
  const description = cleanText(body.description, 1000);
  const specificLocation = cleanText(body.specificLocation, 150);
  const isAnonymous = body.isAnonymous === true;
  const citizenName = isAnonymous ? '' : cleanText(body.citizenName, 60);
  let phone = '';
  if (!isAnonymous) {
    const normalized = normalizeBdMobile(typeof body.phone === 'string' ? body.phone : '');
    if (!normalized) {
      return { ok: false, error: 'মোবাইল নম্বরটি সঠিক নয়। ১১ অঙ্কের নম্বর দিন (যেমন ০১৭XXXXXXXX), অথবা "নাম-নম্বর দিতে চাই না" বেছে নিন।' };
    }
    phone = normalized;
  }

  if (!title) return { ok: false, error: 'শিরোনাম লিখুন।' };
  if (!description) return { ok: false, error: 'বিবরণ লিখুন।' };
  if (!specificLocation) return { ok: false, error: 'নির্দিষ্ট স্থান বা এলাকার বিবরণ লিখুন।' };
  if (!WARD_IDS.has(body.ward)) return { ok: false, error: 'ওয়ার্ড নির্বাচন করুন।' };
  if (!CATEGORY_IDS.has(body.category)) return { ok: false, error: 'সমস্যার ধরন নির্বাচন করুন।' };

  const urgency: UrgencyLevel = URGENCY.includes(body.urgency) ? body.urgency : 'normal';

  return {
    ok: true,
    value: {
      submissionType,
      title,
      description,
      category: body.category,
      ward: body.ward,
      specificLocation,
      citizenName,
      phone,
      isAnonymous,
      urgency,
    },
  };
}

async function createProblemRecord(input: NewProblemInput): Promise<ProblemReport> {
  const isAdvice = input.submissionType === 'advice';
  const prefix = isAdvice ? 'ADV' : 'JNS';
  const year = new Date().getFullYear();
  const nowIso = new Date().toISOString();

  for (let attempt = 0; attempt < 8; attempt++) {
    const digits = attempt < 5 ? 4 : 6;
    const num = crypto.randomInt(10 ** (digits - 1), 10 ** digits);
    const trackingCode = `${prefix}-${year}-${num}`;
    const id = `${isAdvice ? 'adv' : 'prob'}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

    const problem: ProblemReport = {
      id,
      trackingCode,
      submissionType: input.submissionType,
      title: input.title,
      description: input.description,
      category: input.category,
      ward: input.ward,
      specificLocation: input.specificLocation,
      citizenName: input.isAnonymous ? ANON_NAME : input.citizenName || DEFAULT_NAME,
      phone: input.phone,
      isAnonymous: input.isAnonymous,
      urgency: input.urgency,
      status: 'pending',
      createdAt: nowIso,
      upvotes: 1,
      timeline: [
        {
          id: `t-${Date.now()}-1`,
          timestamp: nowIso,
          status: 'pending',
          noteBn: isAdvice
            ? 'নাগরিকের মূল্যবান উপদেশ ও পরামর্শ গৃহীত হয়েছে। পর্যালোচনার অপেক্ষায়।'
            : 'নাগরিকের অভিযোগটি গৃহীত হয়েছে। প্রাথমিক পর্যালোচনার অপেক্ষায়।',
          noteEn: isAdvice
            ? 'Citizen advice registered. Awaiting review.'
            : 'Grievance received. Awaiting initial inspection.',
          author: 'জনসেবা সিস্টেম',
        },
      ],
    };

    try {
      return await insertProblem(problem);
    } catch (err: any) {
      if (/UNIQUE|constraint/i.test(String(err?.message))) continue; // কোড মিলে গেলে আবার চেষ্টা
      throw err;
    }
  }
  throw new Error('Could not generate a unique tracking code');
}

function parseManifestoItem(body: any, forcedId?: string): ManifestoItem | null {
  if (!body || typeof body !== 'object') return null;
  const id = forcedId ?? (typeof body.id === 'string' ? body.id : '');
  if (!ID_PATTERN.test(id)) return null;

  const titleBn = cleanText(body.titleBn, 200);
  if (!titleBn) return null;

  const category: ManifestoCategory = MANIFESTO_CATEGORY_IDS.has(body.category)
    ? body.category
    : 'roads_infrastructure';
  const status: ManifestoStatus = MANIFESTO_STATUSES.includes(body.status) ? body.status : 'planned';
  const progress = Math.max(0, Math.min(100, Math.round(Number(body.progressPercentage) || 0)));

  const milestones = Array.isArray(body.milestones)
    ? body.milestones.slice(0, 30).map((m: any, i: number) => ({
        id: ID_PATTERN.test(String(m?.id)) ? String(m.id) : `m-${Date.now()}-${i}`,
        textBn: cleanText(m?.textBn, 300),
        textEn: cleanText(m?.textEn, 300),
        isDone: m?.isDone === true,
      }))
    : [];

  return {
    id,
    titleBn,
    titleEn: cleanText(body.titleEn, 200),
    category,
    summaryBn: cleanText(body.summaryBn, 500),
    summaryEn: cleanText(body.summaryEn, 500),
    descriptionBn: cleanText(body.descriptionBn, 3000),
    descriptionEn: cleanText(body.descriptionEn, 3000),
    progressPercentage: progress,
    status,
    targetYear: cleanText(body.targetYear, 40),
    budgetOrScope: cleanText(body.budgetOrScope, 300),
    milestones,
    lastUpdated: new Date().toISOString(),
  };
}

function parseProfile(body: any): LeaderProfile | null {
  if (!body || typeof body !== 'object') return null;
  const name = cleanText(body.name, 80);
  if (!name) return null;
  const image = typeof body.profileImage === 'string' && /^(\/|https:\/\/)/.test(body.profileImage)
    ? body.profileImage.slice(0, 300)
    : '/leader.jpg';
  return {
    name,
    designation: cleanText(body.designation, 120),
    promise: cleanText(body.promise, 150),
    mainSlogan: cleanText(body.mainSlogan, 150),
    subSlogan: cleanText(body.subSlogan, 150),
    heroAnnouncement: cleanText(body.heroAnnouncement, 200),
    profileImage: image,
    phone: cleanPhone(body.phone) || '',
    email: cleanText(body.email, 80),
    officeAddress: cleanText(body.officeAddress, 200),
  };
}

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(securityHeaders);
  app.use(express.json({ limit: '100kb' }));
  app.use('/api', sameOriginOnly);

  // ডেটাবেস একবারই প্রস্তুত করা হয় (serverless-এও কাজ করে)
  let dbReady: Promise<void> | null = null;
  const ensureDb = () => {
    if (!dbReady) {
      dbReady = initDatabase().catch((err) => {
        dbReady = null;
        throw err;
      });
    }
    return dbReady;
  };

  const needsDb = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      await ensureDb();
      next();
    } catch (err) {
      console.error('[DB] init failed:', err);
      res.status(503).json({ error: 'ডেটাবেস এই মুহূর্তে প্রস্তুত নয়। একটু পরে আবার চেষ্টা করুন।' });
    }
  };

  /** Turso ছাড়া Vercel-এ লেখা হলে তথ্য হারিয়ে যায়; তাই লেখা বন্ধ */
  const needsPersistentDb = (_req: Request, res: Response, next: NextFunction) => {
    if (!isDbPersistent) {
      return res.status(503).json({
        error: 'সার্ভারে স্থায়ী ডেটাবেস (Turso) সেট করা নেই, তাই এখন তথ্য জমা নেওয়া যাচ্ছে না।',
      });
    }
    next();
  };

  // ==========================================
  // অ্যাডমিন লগইন
  // ==========================================
  app.post(
    '/api/admin/login',
    rateLimit('login', 10, 15 * 60 * 1000, 'অনেকবার ভুল চেষ্টা হয়েছে। ১৫ মিনিট পরে আবার চেষ্টা করুন।'),
    (req: Request, res: Response) => {
      if (!isAuthConfigured()) {
        return res.status(503).json({ error: 'অ্যাডমিন লগইন এখনো সেটআপ করা হয়নি।' });
      }
      if (!checkPassword(req.body?.password)) {
        return res.status(401).json({ error: 'পাসওয়ার্ড সঠিক নয়।' });
      }
      const { token, expires } = issueToken();
      setAdminCookie(res, token);
      res.json({ success: true, expires });
    }
  );

  app.post('/api/admin/logout', (_req: Request, res: Response) => {
    clearAdminCookie(res);
    res.json({ success: true });
  });

  app.get('/api/admin/session', (req: Request, res: Response) => {
    res.json({ authenticated: isAdminRequest(req), configured: isAuthConfigured() });
  });

  // এখান থেকে নিচের সব রুটে ডেটাবেস লাগে
  app.use('/api', needsDb);

  // ==========================================
  // সবার জন্য (পাবলিক)
  // ==========================================
  app.get('/api/problems', async (_req: Request, res: Response) => {
    try {
      const problems = await getAllProblems();
      res.json(problems.map(toPublic));
    } catch (err) {
      console.error('Failed to get problems:', err);
      res.status(500).json({ error: 'তথ্য আনা যায়নি।' });
    }
  });

  app.post('/api/problems', needsPersistentDb, async (req: Request, res: Response) => {
      try {
        const parsed = parseNewProblem(req.body);
        if (!parsed.ok) return res.status(400).json({ error: parsed.error });
        const created = await createProblemRecord(parsed.value);
        res.status(201).json({ ...toPublic(created), userUpvoted: true });
      } catch (err) {
        console.error('Failed to create problem:', err);
        res.status(500).json({ error: 'জমা নেওয়া যায়নি। একটু পরে আবার চেষ্টা করুন।' });
      }
  });

  app.post('/api/problems/:id/upvote', needsPersistentDb, async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        if (!ID_PATTERN.test(id)) return res.status(400).json({ error: 'ভুল আইডি।' });
        const delta = req.body?.delta === -1 ? -1 : 1; // শুধু +১ বা −১
        const count = await upvoteProblem(id, delta);
        res.json({ id, upvotes: count });
      } catch (err) {
        console.error('Failed to upvote problem:', err);
        res.status(500).json({ error: 'সমর্থন নথিভুক্ত করা যায়নি।' });
      }
  });

  app.get('/api/manifesto', async (_req: Request, res: Response) => {
    try {
      res.json(await getAllManifestoItems());
    } catch (err) {
      console.error('Failed to get manifesto items:', err);
      res.status(500).json({ error: 'ইশতেহার আনা যায়নি।' });
    }
  });

  app.get('/api/profile', async (_req: Request, res: Response) => {
    try {
      res.json(await getLeaderProfile());
    } catch (err) {
      console.error('Failed to get leader profile:', err);
      res.status(500).json({ error: 'প্রোফাইল আনা যায়নি।' });
    }
  });

  // ==========================================
  // শুধু অ্যাডমিন
  // ==========================================
  app.get('/api/status', requireAdmin, async (_req: Request, res: Response) => {
    try {
      res.json(await getDatabaseStatus());
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Internal database error' });
    }
  });

  // শুধু অ্যাডমিন: নাম ও ফোনসহ পূর্ণ তালিকা
  app.get('/api/admin/problems', requireAdmin, async (_req: Request, res: Response) => {
    try {
      res.setHeader('Cache-Control', 'no-store');
      res.json(await getAllProblems());
    } catch (err) {
      console.error('Failed to get admin problems:', err);
      res.status(500).json({ error: 'তথ্য আনা যায়নি।' });
    }
  });

  app.patch('/api/problems/:id', requireAdmin, needsPersistentDb, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!ID_PATTERN.test(id)) return res.status(400).json({ error: 'ভুল আইডি।' });
      const status = req.body?.status as ProblemStatus;
      if (!STATUSES.includes(status)) return res.status(400).json({ error: 'অবস্থা সঠিক নয়।' });
      const noteText = cleanText(req.body?.noteText, 500);
      const officerName = cleanText(req.body?.officerName, 80);
      const updated = await updateProblemStatus(id, status, noteText, officerName);
      if (!updated) return res.status(404).json({ error: 'অভিযোগ পাওয়া যায়নি।' });
      res.json(toPublic(updated));
    } catch (err) {
      console.error('Failed to update problem status:', err);
      res.status(500).json({ error: 'হালনাগাদ করা যায়নি।' });
    }
  });

  app.delete('/api/problems/:id', requireAdmin, needsPersistentDb, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!ID_PATTERN.test(id)) return res.status(400).json({ error: 'ভুল আইডি।' });
      const success = await deleteProblem(id);
      if (!success) return res.status(404).json({ error: 'অভিযোগ পাওয়া যায়নি।' });
      res.json({ success: true, id });
    } catch (err) {
      console.error('Failed to delete problem:', err);
      res.status(500).json({ error: 'মোছা যায়নি।' });
    }
  });

  app.post('/api/manifesto', requireAdmin, needsPersistentDb, async (req: Request, res: Response) => {
    try {
      const item = parseManifestoItem(req.body);
      if (!item) return res.status(400).json({ error: 'ইশতেহারের তথ্য সঠিক নয়।' });
      res.status(201).json(await insertManifestoItem(item));
    } catch (err) {
      console.error('Failed to create manifesto item:', err);
      res.status(500).json({ error: 'সংরক্ষণ করা যায়নি।' });
    }
  });

  app.put('/api/manifesto/:id', requireAdmin, needsPersistentDb, async (req: Request, res: Response) => {
    try {
      const item = parseManifestoItem(req.body, req.params.id);
      if (!item) return res.status(400).json({ error: 'ইশতেহারের তথ্য সঠিক নয়।' });
      res.json(await updateManifestoItem(item));
    } catch (err) {
      console.error('Failed to update manifesto item:', err);
      res.status(500).json({ error: 'হালনাগাদ করা যায়নি।' });
    }
  });

  app.delete('/api/manifesto/:id', requireAdmin, needsPersistentDb, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!ID_PATTERN.test(id)) return res.status(400).json({ error: 'ভুল আইডি।' });
      const success = await deleteManifestoItem(id);
      if (!success) return res.status(404).json({ error: 'পাওয়া যায়নি।' });
      res.json({ success: true, id });
    } catch (err) {
      console.error('Failed to delete manifesto item:', err);
      res.status(500).json({ error: 'মোছা যায়নি।' });
    }
  });

  app.delete('/api/manifesto-completed/bulk', requireAdmin, needsPersistentDb, async (_req: Request, res: Response) => {
    try {
      res.json({ success: true, deletedCount: await deleteCompletedManifestos() });
    } catch (err) {
      console.error('Failed to delete completed manifestos:', err);
      res.status(500).json({ error: 'মোছা যায়নি।' });
    }
  });

  app.post('/api/manifesto/reset', requireAdmin, needsPersistentDb, async (_req: Request, res: Response) => {
    try {
      res.json(await resetManifestoItems(INITIAL_MANIFESTO_ITEMS));
    } catch (err) {
      console.error('Failed to reset manifesto:', err);
      res.status(500).json({ error: 'রিসেট করা যায়নি।' });
    }
  });

  app.put('/api/profile', requireAdmin, needsPersistentDb, async (req: Request, res: Response) => {
    try {
      const profile = parseProfile(req.body);
      if (!profile) return res.status(400).json({ error: 'প্রোফাইলের তথ্য সঠিক নয়।' });
      res.json(await updateLeaderProfile(profile));
    } catch (err) {
      console.error('Failed to update leader profile:', err);
      res.status(500).json({ error: 'হালনাগাদ করা যায়নি।' });
    }
  });

  // অজানা /api পথ
  app.use('/api', (_req: Request, res: Response) => {
    res.status(404).json({ error: 'পথ পাওয়া যায়নি।' });
  });

  return app;
}

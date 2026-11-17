import { createClient, Client } from '@libsql/client';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { ProblemReport, ManifestoItem, LeaderProfile } from '../src/types/index.ts';
import { DEFAULT_PROFILE } from '../src/data/mockData.ts';
import { INITIAL_MANIFESTO_ITEMS } from '../src/data/manifestoData.ts';

dotenv.config();

// Prepare local data storage directory for fallback file database
const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const rawUrl = process.env.TURSO_DATABASE_URL?.trim();
const rawToken = process.env.TURSO_AUTH_TOKEN?.trim();

export const isTursoRemote = Boolean(rawUrl && (rawUrl.startsWith('libsql://') || rawUrl.startsWith('https://') || rawUrl.startsWith('http://')));
export const databaseUrl = isTursoRemote ? rawUrl! : `file:${path.join(dataDir, 'dhamti.db')}`;

export const db: Client = createClient({
  url: databaseUrl,
  authToken: rawToken || undefined,
});

/**
 * Initialize Turso database tables and initial seed data
 */
export async function initDatabase() {
  console.log(`[Turso DB] Connecting to database (${isTursoRemote ? 'Turso Cloud' : 'Local libSQL File'})...`);

  // 1. Problems table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS problems (
      id TEXT PRIMARY KEY,
      tracking_code TEXT NOT NULL UNIQUE,
      submission_type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      ward TEXT NOT NULL,
      specific_location TEXT DEFAULT '',
      citizen_name TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      is_anonymous INTEGER NOT NULL DEFAULT 0,
      urgency TEXT NOT NULL DEFAULT 'normal',
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL,
      upvotes INTEGER NOT NULL DEFAULT 0,
      timeline TEXT NOT NULL DEFAULT '[]',
      assigned_officer TEXT DEFAULT '',
      resolution_note TEXT DEFAULT ''
    );
  `);

  // 2. Manifesto Items table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS manifesto_items (
      id TEXT PRIMARY KEY,
      title_bn TEXT NOT NULL,
      title_en TEXT NOT NULL,
      category TEXT NOT NULL,
      summary_bn TEXT NOT NULL,
      summary_en TEXT NOT NULL,
      description_bn TEXT NOT NULL,
      description_en TEXT NOT NULL,
      progress_percentage INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'planned',
      target_year TEXT NOT NULL,
      budget_or_scope TEXT NOT NULL,
      milestones TEXT NOT NULL DEFAULT '[]',
      last_updated TEXT NOT NULL
    );
  `);

  // 3. Leader Profile table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS leader_profile (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      designation TEXT NOT NULL,
      promise TEXT NOT NULL,
      main_slogan TEXT NOT NULL,
      sub_slogan TEXT NOT NULL,
      hero_announcement TEXT NOT NULL,
      profile_image TEXT,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      office_address TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Seed Leader Profile if empty
  const profileCountResult = await db.execute(`SELECT COUNT(*) as count FROM leader_profile WHERE id = 'current'`);
  const profileCount = Number(profileCountResult.rows[0]?.count ?? 0);
  if (profileCount === 0) {
    console.log('[Turso DB] Seeding default leader profile...');
    await db.execute({
      sql: `
        INSERT INTO leader_profile (
          id, name, designation, promise, main_slogan, sub_slogan, hero_announcement, profile_image, phone, email, office_address, updated_at
        ) VALUES (
          'current', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `,
      args: [
        DEFAULT_PROFILE.name,
        DEFAULT_PROFILE.designation,
        DEFAULT_PROFILE.promise,
        DEFAULT_PROFILE.mainSlogan,
        DEFAULT_PROFILE.subSlogan,
        DEFAULT_PROFILE.heroAnnouncement,
        DEFAULT_PROFILE.profileImage,
        DEFAULT_PROFILE.phone,
        DEFAULT_PROFILE.email,
        DEFAULT_PROFILE.officeAddress,
        new Date().toISOString(),
      ],
    });
  }

  // Seed Manifesto Items if empty
  const manifestoCountResult = await db.execute(`SELECT COUNT(*) as count FROM manifesto_items`);
  const manifestoCount = Number(manifestoCountResult.rows[0]?.count ?? 0);
  if (manifestoCount === 0) {
    console.log(`[Turso DB] Seeding ${INITIAL_MANIFESTO_ITEMS.length} initial manifesto items...`);
    for (const item of INITIAL_MANIFESTO_ITEMS) {
      await db.execute({
        sql: `
          INSERT INTO manifesto_items (
            id, title_bn, title_en, category, summary_bn, summary_en, description_bn, description_en, progress_percentage, status, target_year, budget_or_scope, milestones, last_updated
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          item.id,
          item.titleBn,
          item.titleEn,
          item.category,
          item.summaryBn,
          item.summaryEn,
          item.descriptionBn,
          item.descriptionEn,
          item.progressPercentage,
          item.status,
          item.targetYear,
          item.budgetOrScope,
          JSON.stringify(item.milestones || []),
          item.lastUpdated,
        ],
      });
    }
  }

  console.log('[Turso DB] Tables and seeds initialized successfully.');
}

// ==========================================
// PROBLEMS CRUD OPERATIONS
// ==========================================

export async function getAllProblems(): Promise<ProblemReport[]> {
  const result = await db.execute(`SELECT * FROM problems ORDER BY created_at DESC`);
  return result.rows.map((row) => {
    let timeline = [];
    try {
      timeline = typeof row.timeline === 'string' ? JSON.parse(row.timeline) : [];
    } catch {
      timeline = [];
    }
    return {
      id: String(row.id),
      trackingCode: String(row.tracking_code),
      submissionType: row.submission_type as ProblemReport['submissionType'],
      title: String(row.title),
      description: String(row.description),
      category: String(row.category),
      ward: String(row.ward),
      specificLocation: String(row.specific_location ?? ''),
      citizenName: String(row.citizen_name ?? ''),
      phone: String(row.phone ?? ''),
      isAnonymous: Boolean(row.is_anonymous),
      urgency: row.urgency as ProblemReport['urgency'],
      status: row.status as ProblemReport['status'],
      createdAt: String(row.created_at),
      upvotes: Number(row.upvotes ?? 0),
      timeline,
      assignedOfficer: row.assigned_officer ? String(row.assigned_officer) : undefined,
      resolutionNote: row.resolution_note ? String(row.resolution_note) : undefined,
    };
  });
}

export async function insertProblem(problem: ProblemReport): Promise<ProblemReport> {
  await db.execute({
    sql: `
      INSERT INTO problems (
        id, tracking_code, submission_type, title, description, category, ward, specific_location, citizen_name, phone, is_anonymous, urgency, status, created_at, upvotes, timeline, assigned_officer, resolution_note
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      problem.id,
      problem.trackingCode,
      problem.submissionType,
      problem.title,
      problem.description,
      problem.category,
      problem.ward,
      problem.specificLocation || '',
      problem.citizenName || '',
      problem.phone || '',
      problem.isAnonymous ? 1 : 0,
      problem.urgency,
      problem.status,
      problem.createdAt,
      problem.upvotes || 0,
      JSON.stringify(problem.timeline || []),
      problem.assignedOfficer || '',
      problem.resolutionNote || '',
    ],
  });
  return problem;
}

export async function updateProblemStatus(
  id: string,
  newStatus: ProblemReport['status'],
  noteText: string,
  officerName: string
): Promise<ProblemReport | null> {
  const existing = await db.execute({
    sql: `SELECT * FROM problems WHERE id = ?`,
    args: [id],
  });
  if (existing.rows.length === 0) return null;

  const row = existing.rows[0];
  let timeline: any[] = [];
  try {
    timeline = typeof row.timeline === 'string' ? JSON.parse(row.timeline) : [];
  } catch {
    timeline = [];
  }

  const newEvent = {
    id: `ev-${Date.now()}`,
    timestamp: new Date().toISOString(),
    status: newStatus,
    noteBn: noteText || (newStatus === 'resolved' ? 'সমস্যাটির সফল সমাধান সম্পন্ন হয়েছে।' : 'আবেদনটি যাচাই-বাছাই প্রক্রিয়ায় রয়েছে।'),
    noteEn: noteText || (newStatus === 'resolved' ? 'Problem officially resolved.' : 'Issue is under review.'),
    author: officerName || 'মোঃ আনোয়ার হোসেন ভূঁইয়া (জনসেবা সেল)',
  };

  timeline.push(newEvent);

  await db.execute({
    sql: `
      UPDATE problems
      SET status = ?, timeline = ?, assigned_officer = ?, resolution_note = ?
      WHERE id = ?
    `,
    args: [
      newStatus,
      JSON.stringify(timeline),
      officerName || (row.assigned_officer as string) || '',
      noteText || (row.resolution_note as string) || '',
      id,
    ],
  });

  const updated = await db.execute({
    sql: `SELECT * FROM problems WHERE id = ?`,
    args: [id],
  });
  const upRow = updated.rows[0];
  return {
    id: String(upRow.id),
    trackingCode: String(upRow.tracking_code),
    submissionType: upRow.submission_type as ProblemReport['submissionType'],
    title: String(upRow.title),
    description: String(upRow.description),
    category: String(upRow.category),
    ward: String(upRow.ward),
    specificLocation: String(upRow.specific_location ?? ''),
    citizenName: String(upRow.citizen_name ?? ''),
    phone: String(upRow.phone ?? ''),
    isAnonymous: Boolean(upRow.is_anonymous),
    urgency: upRow.urgency as ProblemReport['urgency'],
    status: upRow.status as ProblemReport['status'],
    createdAt: String(upRow.created_at),
    upvotes: Number(upRow.upvotes ?? 0),
    timeline,
    assignedOfficer: upRow.assigned_officer ? String(upRow.assigned_officer) : undefined,
    resolutionNote: upRow.resolution_note ? String(upRow.resolution_note) : undefined,
  };
}

export async function upvoteProblem(id: string, delta: number): Promise<number> {
  await db.execute({
    sql: `UPDATE problems SET upvotes = MAX(0, upvotes + ?) WHERE id = ?`,
    args: [delta, id],
  });
  const res = await db.execute({
    sql: `SELECT upvotes FROM problems WHERE id = ?`,
    args: [id],
  });
  return Number(res.rows[0]?.upvotes ?? 0);
}

export async function deleteProblem(id: string): Promise<boolean> {
  const res = await db.execute({
    sql: `DELETE FROM problems WHERE id = ?`,
    args: [id],
  });
  return res.rowsAffected > 0;
}

// ==========================================
// MANIFESTO CRUD OPERATIONS
// ==========================================

export async function getAllManifestoItems(): Promise<ManifestoItem[]> {
  const result = await db.execute(`SELECT * FROM manifesto_items ORDER BY id ASC`);
  return result.rows.map((row) => {
    let milestones = [];
    try {
      milestones = typeof row.milestones === 'string' ? JSON.parse(row.milestones) : [];
    } catch {
      milestones = [];
    }
    return {
      id: String(row.id),
      titleBn: String(row.title_bn),
      titleEn: String(row.title_en),
      category: row.category as ManifestoItem['category'],
      summaryBn: String(row.summary_bn),
      summaryEn: String(row.summary_en),
      descriptionBn: String(row.description_bn),
      descriptionEn: String(row.description_en),
      progressPercentage: Number(row.progress_percentage ?? 0),
      status: row.status as ManifestoItem['status'],
      targetYear: String(row.target_year),
      budgetOrScope: String(row.budget_or_scope),
      milestones,
      lastUpdated: String(row.last_updated),
    };
  });
}

export async function insertManifestoItem(item: ManifestoItem): Promise<ManifestoItem> {
  await db.execute({
    sql: `
      INSERT INTO manifesto_items (
        id, title_bn, title_en, category, summary_bn, summary_en, description_bn, description_en, progress_percentage, status, target_year, budget_or_scope, milestones, last_updated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      item.id,
      item.titleBn,
      item.titleEn,
      item.category,
      item.summaryBn,
      item.summaryEn,
      item.descriptionBn,
      item.descriptionEn,
      item.progressPercentage,
      item.status,
      item.targetYear,
      item.budgetOrScope,
      JSON.stringify(item.milestones || []),
      item.lastUpdated || new Date().toISOString(),
    ],
  });
  return item;
}

export async function updateManifestoItem(item: ManifestoItem): Promise<ManifestoItem> {
  await db.execute({
    sql: `
      UPDATE manifesto_items
      SET title_bn = ?, title_en = ?, category = ?, summary_bn = ?, summary_en = ?, description_bn = ?, description_en = ?, progress_percentage = ?, status = ?, target_year = ?, budget_or_scope = ?, milestones = ?, last_updated = ?
      WHERE id = ?
    `,
    args: [
      item.titleBn,
      item.titleEn,
      item.category,
      item.summaryBn,
      item.summaryEn,
      item.descriptionBn,
      item.descriptionEn,
      item.progressPercentage,
      item.status,
      item.targetYear,
      item.budgetOrScope,
      JSON.stringify(item.milestones || []),
      new Date().toISOString(),
      item.id,
    ],
  });
  return item;
}

export async function deleteManifestoItem(id: string): Promise<boolean> {
  const res = await db.execute({
    sql: `DELETE FROM manifesto_items WHERE id = ?`,
    args: [id],
  });
  return res.rowsAffected > 0;
}

export async function deleteCompletedManifestos(): Promise<number> {
  const res = await db.execute(`DELETE FROM manifesto_items WHERE status = 'completed'`);
  return res.rowsAffected;
}

export async function resetManifestoItems(initialItems: ManifestoItem[]): Promise<ManifestoItem[]> {
  await db.execute(`DELETE FROM manifesto_items`);
  for (const item of initialItems) {
    await insertManifestoItem(item);
  }
  return initialItems;
}

// ==========================================
// LEADER PROFILE CRUD OPERATIONS
// ==========================================

export async function getLeaderProfile(): Promise<LeaderProfile> {
  const res = await db.execute(`SELECT * FROM leader_profile WHERE id = 'current'`);
  if (res.rows.length === 0) {
    return DEFAULT_PROFILE;
  }
  const row = res.rows[0];
  return {
    name: String(row.name),
    designation: String(row.designation),
    promise: String(row.promise),
    mainSlogan: String(row.main_slogan),
    subSlogan: String(row.sub_slogan),
    heroAnnouncement: String(row.hero_announcement),
    profileImage: row.profile_image ? String(row.profile_image) : '/leader.jpg',
    phone: String(row.phone || DEFAULT_PROFILE.phone),
    email: String(row.email || DEFAULT_PROFILE.email),
    officeAddress: String(row.office_address || DEFAULT_PROFILE.officeAddress),
  };
}

export async function updateLeaderProfile(profile: LeaderProfile): Promise<LeaderProfile> {
  const now = new Date().toISOString();
  await db.execute({
    sql: `
      INSERT INTO leader_profile (
        id, name, designation, promise, main_slogan, sub_slogan, hero_announcement, profile_image, phone, email, office_address, updated_at
      ) VALUES ('current', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        designation = excluded.designation,
        promise = excluded.promise,
        main_slogan = excluded.main_slogan,
        sub_slogan = excluded.sub_slogan,
        hero_announcement = excluded.hero_announcement,
        profile_image = excluded.profile_image,
        phone = excluded.phone,
        email = excluded.email,
        office_address = excluded.office_address,
        updated_at = excluded.updated_at
    `,
    args: [
      profile.name,
      profile.designation,
      profile.promise,
      profile.mainSlogan,
      profile.subSlogan,
      profile.heroAnnouncement,
      profile.profileImage || '/leader.jpg',
      profile.phone || DEFAULT_PROFILE.phone,
      profile.email || DEFAULT_PROFILE.email,
      profile.officeAddress || DEFAULT_PROFILE.officeAddress,
      now,
    ],
  });
  return profile;
}

// ==========================================
// DB STATUS INFO
// ==========================================

export async function getDatabaseStatus() {
  try {
    const pCountRes = await db.execute(`SELECT COUNT(*) as count FROM problems`);
    const mCountRes = await db.execute(`SELECT COUNT(*) as count FROM manifesto_items`);

    let safeUrl = 'Local libSQL (dhamti.db)';
    if (isTursoRemote) {
      try {
        const parsed = new URL(databaseUrl.replace('libsql://', 'https://'));
        safeUrl = `Turso Cloud (${parsed.hostname})`;
      } catch {
        safeUrl = 'Turso Cloud (libSQL Remote)';
      }
    }

    return {
      connected: true,
      provider: 'turso',
      mode: isTursoRemote ? 'turso-cloud' : 'turso-libsql-local',
      isRemote: isTursoRemote,
      databaseUrl: safeUrl,
      problemsCount: Number(pCountRes.rows[0]?.count ?? 0),
      manifestoCount: Number(mCountRes.rows[0]?.count ?? 0),
    };
  } catch (error: any) {
    return {
      connected: false,
      provider: 'turso',
      mode: isTursoRemote ? 'turso-cloud' : 'turso-libsql-local',
      isRemote: isTursoRemote,
      error: error?.message || 'Failed to query database',
    };
  }
}

/**
 * সার্ভার-সাইড নিরাপত্তা: অ্যাডমিন লগইন, সেশন কুকি, রেট-লিমিট, ইনপুট পরিষ্কার করা।
 *
 * প্রয়োজনীয় environment variable:
 *   ADMIN_PASSWORD  - অ্যাডমিন প্যানেলের পাসওয়ার্ড (কমপক্ষে ১০ অক্ষর রাখুন)
 *   SESSION_SECRET  - কমপক্ষে ১৬ অক্ষরের এলোমেলো গোপন লেখা (সেশন কুকি সাইন করতে)
 * এই দুটির যেকোনো একটি না থাকলে অ্যাডমিন লগইন বন্ধ থাকবে (নিরাপদ ডিফল্ট)।
 */
import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

export const ADMIN_COOKIE = 'dhamti_admin';
export const SESSION_MS = 8 * 60 * 60 * 1000; // ৮ ঘণ্টা

export function isAuthConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD) && (process.env.SESSION_SECRET || '').length >= 16;
}

function hmac(value: string): string {
  return crypto.createHmac('sha256', process.env.SESSION_SECRET || '').update(value).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function checkPassword(input: unknown): boolean {
  if (typeof input !== 'string' || !isAuthConfigured()) return false;
  return safeEqual(input, process.env.ADMIN_PASSWORD as string);
}

export function issueToken(): { token: string; expires: number } {
  const expires = Date.now() + SESSION_MS;
  const payload = String(expires);
  return { token: `${payload}.${hmac(payload)}`, expires };
}

export function verifyToken(token: string | undefined): boolean {
  if (!token || !isAuthConfigured()) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const expected = hmac(payload);
  if (sig.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  const exp = Number(payload);
  return Number.isFinite(exp) && exp > Date.now();
}

function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() !== name) continue;
    try {
      return decodeURIComponent(part.slice(idx + 1).trim());
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export function isAdminRequest(req: Request): boolean {
  return verifyToken(readCookie(req, ADMIN_COOKIE));
}

export function setAdminCookie(res: Response, token: string): void {
  res.cookie(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL),
    maxAge: SESSION_MS,
    path: '/',
  });
}

export function clearAdminCookie(res: Response): void {
  res.clearCookie(ADMIN_COOKIE, { path: '/' });
}

/** অ্যাডমিন-ওনলি রুটের পাহারাদার */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!isAuthConfigured()) {
    return res.status(503).json({ error: 'অ্যাডমিন লগইন এখনো সেটআপ করা হয়নি (ADMIN_PASSWORD ও SESSION_SECRET দিন)।' });
  }
  if (!isAdminRequest(req)) {
    return res.status(401).json({ error: 'অ্যাডমিন লগইন প্রয়োজন।' });
  }
  next();
}

/** অন্য সাইট থেকে আসা পরিবর্তনমূলক রিকোয়েস্ট আটকায় */
export function sameOriginOnly(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return next();
  const origin = req.headers.origin;
  if (origin) {
    const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || '';
    try {
      if (new URL(origin).host !== host) {
        return res.status(403).json({ error: 'অনুমোদিত নয়।' });
      }
    } catch {
      return res.status(403).json({ error: 'অনুমোদিত নয়।' });
    }
  }
  next();
}

export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
}

// ------------------------------------------------------------
// রেট-লিমিট (মেমরিতে; একটি সার্ভার ইনস্ট্যান্সের জন্য কার্যকর)
// ------------------------------------------------------------
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(name: string, max: number, windowMs: number, message: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    if (buckets.size > 5000) {
      for (const [key, b] of buckets) {
        if (b.resetAt <= now) buckets.delete(key);
      }
    }
    const key = `${name}:${req.ip}`;
    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }
    bucket.count += 1;
    if (bucket.count > max) {
      res.setHeader('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)));
      return res.status(429).json({ error: message });
    }
    next();
  };
}

// ------------------------------------------------------------
// ইনপুট পরিষ্কার করা
// ------------------------------------------------------------
export function cleanText(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, max);
}

export function cleanPhone(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[^0-9+\s-]/g, '').trim().slice(0, 20);
}

/** ফোন মেলানোর জন্য শেষ ১০ অঙ্ক (+880 / 0 উপসর্গের পার্থক্য উপেক্ষা করে) */
export function phoneKey(value: string): string {
  return value.replace(/\D/g, '').slice(-10);
}

export const ID_PATTERN = /^[A-Za-z0-9_-]{1,80}$/;

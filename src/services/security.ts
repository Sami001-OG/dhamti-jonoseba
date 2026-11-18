/**
 * ক্লায়েন্ট-সাইড ইনপুট পরিষ্কার করার সহায়ক ফাংশন।
 * অ্যাডমিন লগইন এখন সার্ভারে হয় (server/security.ts), ব্রাউজারে কোনো PIN রাখা হয় না।
 */

/**
 * Sanitizes generic user-supplied strings to neutralize HTML, script tags, and XSS injection vectors
 */
export function sanitizeString(input: string, maxLength = 1000): string {
  if (!input) return '';
  return input
    .replace(/[<>]/g, '') // strip HTML opening/closing tags
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Validates and sanitizes a phone number
 */
export function sanitizePhoneNumber(phone: string): string {
  if (!phone) return '';
  // Keep only digits, +, and space/dashes
  const cleaned = phone.replace(/[^0-9+\s-]/g, '').trim();
  return cleaned.slice(0, 20);
}

/**
 * Masks a citizen phone number for public display (e.g., 01712345678 -> 017****5678)
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone || phone.trim().length < 6) return '***';
  const clean = phone.trim();
  const start = clean.slice(0, 3);
  const end = clean.slice(-3);
  return `${start}****${end}`;
}

/**
 * Neutralizes potential CSV formula injection attacks (starts with =, +, -, @, tab, or carriage return)
 */
export function sanitizeForCsv(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value).trim();
  if (str.length > 0 && /^[=+\-@\t\r]/.test(str)) {
    return `'${str}`; // Prepend single quote to force spreadsheet programs to treat as literal text
  }
  return str;
}

/**
 * Validates an uploaded image file for safe type and reasonable size
 */
export function validateImageFile(file: File, maxSizeBytes = 3 * 1024 * 1024): { valid: boolean; error?: string } {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedMimeTypes.includes(file.type)) {
    return { valid: false, error: 'invalid_type' };
  }
  if (file.size > maxSizeBytes) {
    return { valid: false, error: 'file_too_large' };
  }
  return { valid: true };
}

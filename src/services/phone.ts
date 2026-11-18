/**
 * বাংলাদেশি মোবাইল নম্বর স্বাভাবিকীকরণ (ব্রাউজার ও সার্ভার দুই জায়গাতেই ব্যবহার হয়)।
 * কোনো OTP/কোড যাচাই নেই, শুধু নম্বরটি দেখতে সঠিক কিনা দেখা হয়।
 *
 * গ্রহণযোগ্য রূপ: 01613394074, ০১৬১৩-৩৯৪০৭৪, +880 1613 394074, 8801613394074, 1613394074
 */
const BN_DIGITS = '০১২৩৪৫৬৭৮৯';

export function toAsciiDigits(input: string): string {
  return input.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
}

/** সঠিক হলে "01XXXXXXXXX" (১১ অঙ্ক) ফেরত দেয়, নইলে null */
export function normalizeBdMobile(input: string): string | null {
  if (typeof input !== 'string') return null;
  let d = toAsciiDigits(input).replace(/[^\d+]/g, '');
  if (d.startsWith('+')) d = d.slice(1);
  if (d.startsWith('880')) d = '0' + d.slice(3);
  else if (/^1[3-9]\d{8}$/.test(d)) d = '0' + d; // শুরুর ০ ভুলে বাদ পড়লে
  return /^01[3-9]\d{8}$/.test(d) ? d : null;
}

/** দেখানোর জন্য: 01613-394074 */
export function formatBdMobile(normalized: string): string {
  return normalized.length === 11 ? `${normalized.slice(0, 5)}-${normalized.slice(5)}` : normalized;
}

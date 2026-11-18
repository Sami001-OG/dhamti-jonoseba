/**
 * "এই ফোনে জমা দেওয়া অভিযোগ" মনে রাখা। লগইন বা কোড মনে রাখার ঝামেলা ছাড়াই
 * নাগরিক পরে 'অবস্থা দেখুন' থেকে নিজের অভিযোগ দেখতে পারেন।
 * শুধু ট্র্যাকিং কোড ও পূর্বের নাম/নম্বর এই ফোনের ব্রাউজারেই থাকে, সার্ভারে নয়।
 */
const KEY_CODES = 'dhamti_my_reports_v1';
const KEY_CONTACT = 'dhamti_contact_v1';

export function readMyCodes(): string[] {
  try {
    const raw = localStorage.getItem(KEY_CODES);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((c) => typeof c === 'string').slice(0, 30) : [];
  } catch {
    return [];
  }
}

export function rememberCode(code: string): void {
  try {
    const list = [code, ...readMyCodes().filter((c) => c !== code)].slice(0, 30);
    localStorage.setItem(KEY_CODES, JSON.stringify(list));
  } catch {
    // ব্রাউজার সংরক্ষণ বন্ধ থাকলে সমস্যা নেই
  }
}

export function readContact(): { name: string; phone: string } {
  try {
    const raw = localStorage.getItem(KEY_CONTACT);
    const v = raw ? JSON.parse(raw) : {};
    return {
      name: typeof v?.name === 'string' ? v.name : '',
      phone: typeof v?.phone === 'string' ? v.phone : '',
    };
  } catch {
    return { name: '', phone: '' };
  }
}

export function rememberContact(name: string, phone: string): void {
  try {
    localStorage.setItem(KEY_CONTACT, JSON.stringify({ name, phone }));
  } catch {
    // উপেক্ষা
  }
}

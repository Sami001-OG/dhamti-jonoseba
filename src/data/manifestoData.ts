import type { ManifestoItem, ManifestoCategory } from '../types';

export const MANIFESTO_CATEGORIES_CONFIG: Record<
  ManifestoCategory,
  { nameBn: string; nameEn: string; icon: string; color: string }
> = {
  roads_infrastructure: {
    nameBn: 'সড়ক ও টেকসই যোগাযোগ',
    nameEn: 'Roads & Resilient Connectivity',
    icon: 'Hammer',
    color: 'emerald',
  },
  education_culture: {
    nameBn: 'আধুনিক শিক্ষা ও মেধা বিকাশ',
    nameEn: 'Modern Education & Youth Mentorship',
    icon: 'GraduationCap',
    color: 'blue',
  },
  healthcare_wellbeing: {
    nameBn: '২৪/৭ জনস্বাস্থ্য ও মাতৃত্বসেবা',
    nameEn: '24/7 Healthcare & Maternal Care',
    icon: 'HeartPulse',
    color: 'rose',
  },
  digital_youth: {
    nameBn: 'ডিজিটাল ইউনিয়ন ও কর্মসংস্থান',
    nameEn: 'Digital Union & Youth Tech Hub',
    icon: 'Laptop',
    color: 'indigo',
  },
  agriculture_drainage: {
    nameBn: 'কৃষি, সেচ ও খাল পুনঃখনন',
    nameEn: 'Agriculture, Irrigation & Canal Dredging',
    icon: 'Sprout',
    color: 'amber',
  },
  social_safety: {
    nameBn: 'সুশাসন ও সামাজিক সুরক্ষা',
    nameEn: 'Good Governance & Social Security',
    icon: 'ShieldCheck',
    color: 'teal',
  },
  environment_clean: {
    nameBn: 'পরিচ্ছন্ন ধামতী ও সবুজায়ন',
    nameEn: 'Clean Dhamti & Eco-Greenery',
    icon: 'Trees',
    color: 'green',
  },
};

// ইশতেহার এখনো প্রকাশিত হয়নি, তাই তালিকা ফাঁকা। প্রকাশের সময় অ্যাডমিন প্যানেল থেকে
// একটি একটি করে প্রতিশ্রুতি যোগ করুন (বা এখানে ManifestoItem আকারে লিখে দিন)।
export const INITIAL_MANIFESTO_ITEMS: ManifestoItem[] = [];

// আগের ডেমো আইটেমের পরিচয় (ডেটাবেস থেকে শুধু অসম্পাদিত ডেমো সারি মুছতে ব্যবহৃত)
export const LEGACY_DEMO_MANIFESTO: { id: string; lastUpdated: string }[] = [
  { id: 'man-01', lastUpdated: '২০২৬-০৩-১৫' },
  { id: 'man-02', lastUpdated: '২০২৬-০৩-২০' },
  { id: 'man-03', lastUpdated: '২০২৬-০২-২৮' },
  { id: 'man-04', lastUpdated: '২০২৬-০৩-১০' },
  { id: 'man-05', lastUpdated: '২০২৬-০৩-২৫' },
  { id: 'man-06', lastUpdated: '২০২৬-০৩-০৫' },
  { id: 'man-07', lastUpdated: '২০২৬-০৩-১৮' },
];

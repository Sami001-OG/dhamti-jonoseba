import React from 'react';
import { Language, LeaderProfile } from '../types';
import { UI_STRINGS, LEADER_PERMANENT_PHOTO_URL } from '../data/mockData';
import { 
  ArrowRight, 
  Search, 
  CheckCircle2, 
  MessageSquareText, 
  PhoneCall, 
  Zap, 
  Clock, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';

interface HeroSectionProps {
  language: Language;
  onOpenReportModal: () => void;
  onOpenTrackModal: () => void;
  totalProblemsCount: number;
  resolvedProblemsCount: number;
  leaderProfile: LeaderProfile;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  language,
  onOpenReportModal,
  onOpenTrackModal,
  totalProblemsCount,
  resolvedProblemsCount,
  leaderProfile,
}) => {
  const strings = UI_STRINGS[language];

  return (
    <section id="hero-banner" className="relative overflow-hidden bg-white border-b border-neutral-200">
      {/* Background national brush work strokes (red, green, golden yellow from the sketch) */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <svg
          viewBox="0 0 1440 600"
          className="w-full h-full object-cover"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M-50,60 Q300,-10 700,90 T1450,40"
            stroke="#dc2626"
            strokeWidth="60"
            strokeLinecap="round"
            className="blur-xl"
          />
          <path
            d="M50,150 Q450,210 900,120 T1500,160"
            stroke="#eab308"
            strokeWidth="50"
            strokeLinecap="round"
            className="blur-2xl"
          />
          <path
            d="M-40,240 Q400,140 950,260 T1500,200"
            stroke="#059669"
            strokeWidth="65"
            strokeLinecap="round"
            className="blur-xl"
          />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: Single Name on Top + Image Popping Up from Slogan */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            {/* The ONLY Name on display (Managed via Admin) */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 text-emerald-900 text-xs font-semibold mb-2.5 border border-emerald-200/80">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span className="bengali-text">{leaderProfile.designation || (language === 'bn' ? 'ধামতী ইউনিয়ন সেবক' : 'Dhamti Union Representative')}</span>
              </div>
              
              {/* Single primary name in refined Bengali editorial serif */}
              <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] font-black text-neutral-900 leading-[1.25] font-serif-bangla">
                {leaderProfile.name || strings.leaderGreeting}
              </h1>

              {/* Sub-promise with human civic tone */}
              <p className="text-lg sm:text-xl font-bold text-emerald-800 mt-2 font-serif-bangla">
                {leaderProfile.promise || strings.leaderPromise}
              </p>
            </div>

            {/* POP-UP STAGE: Person's image popping up from the Slogan Pedestal */}
            <div className="relative mt-8 pt-8">
              
              {/* The Subject Figure / Photo Popping Up Above the Slogan */}
              <div className="relative z-10 flex flex-col items-center">
                
                {/* Popping-up Avatar Frame with dignified civic frame */}
                <div className="relative group">
                  {/* Subtle soft grounding shadow */}
                  <div className="absolute -inset-2 bg-emerald-900/10 rounded-3xl blur-md pointer-events-none"></div>

                  {/* Hardcoded Official Leader Portrait Popping Up Above Slogan */}
                  <div className="relative w-44 h-48 sm:w-52 sm:h-56 md:w-60 md:h-64 rounded-t-3xl overflow-hidden border-t-4 border-x-4 border-emerald-800 shadow-xl bg-neutral-900 flex flex-col items-center justify-end">
                    
                    {/* The Permanent Leader Photo */}
                    <img
                      src={leaderProfile.profileImage || LEADER_PERMANENT_PHOTO_URL}
                      alt={leaderProfile.name}
                      className="w-full h-full object-cover object-top filter contrast-[1.03] group-hover:scale-[1.02] transition-transform duration-500"
                      loading="eager"
                      decoding="async"
                    />

                    {/* Bottom gradient overlay so photo seamlessly blends into the Slogan Podium */}
                    <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-emerald-950 via-emerald-950/70 to-transparent pointer-events-none"></div>

                    {/* National Red Circle & Golden Badge */}
                    <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-600 border-2 border-amber-400 flex items-center justify-center shadow-md pointer-events-none">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-400"></div>
                    </div>

                    {/* Official Verified Banner */}
                    <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-emerald-950/90 backdrop-blur-xs text-[10px] font-bold px-2 py-0.5 rounded text-white border border-emerald-400/40 shadow-xs flex items-center gap-1 pointer-events-none">
                      <ShieldCheck className="w-3 h-3 text-emerald-300" />
                      <span>{language === 'bn' ? 'জনসেবক' : 'LEADER'}</span>
                    </div>
                  </div>
                </div>

                {/* THE SLOGAN PODIUM: The image pops up directly from here */}
                <div className="relative z-20 -mt-3 w-full">
                  <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white p-4 sm:p-5 rounded-2xl shadow-xl border-2 border-emerald-700 relative overflow-hidden text-center">
                    
                    {/* Decorative gold accent line */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500"></div>

                    {/* Slogan Label */}
                    <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-amber-300 mb-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{language === 'bn' ? 'মূল স্লোগান' : 'Official Slogan'}</span>
                    </div>

                    {/* Main Slogan in authentic serif Bangla */}
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-snug drop-shadow-xs break-words font-serif-bangla">
                      “{leaderProfile.mainSlogan}”
                    </p>
                    
                    {/* Small & Sub Slogan */}
                    <p className="text-xs sm:text-sm font-medium text-amber-200 mt-1.5 leading-relaxed break-words font-serif-bangla">
                      {leaderProfile.subSlogan}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-emerald-800 text-[11px] text-emerald-200/90 flex flex-wrap items-center justify-center gap-2 font-medium">
                      <span>{language === 'bn' ? 'ধামতী ইউনিয়ন জনসেবা মঞ্চ' : 'Dhamti Civic Action Forum'}</span>
                      <span>·</span>
                      <span>{leaderProfile.name}</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Fills the entire right side purposefully */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6 pt-4 lg:pt-0">
            
            {/* 1. Slogan Banner: "আমরা এখানে আছি আপনাদের সমস্যা সম্পর্কে জানতে" */}
            <div className="p-5 sm:p-6 bg-gradient-to-br from-emerald-50/70 via-white to-amber-50/40 rounded-3xl border border-emerald-200 shadow-xs relative overflow-hidden">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>{language === 'bn' ? 'নাগরিক সেবা বার্তা' : 'Public Announcement'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900 leading-snug font-serif-bangla">
                {strings.heroSlogan}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-2.5 leading-relaxed">
                {language === 'bn'
                  ? 'আপনার এলাকার যেকোনো দুর্ভোগ বা উন্নয়ন প্রয়োজনের কথা সরাসরি জানান। প্রতিটি আবেদন পর্যবেক্ষণ করে সর্বোচ্চ গুরুত্বের সাথে সমাধান করা হবে।'
                  : 'Report any infrastructure, water, sanitation, or safety issue in your ward. Every submission is directly inspected and acted upon.'}
              </p>
            </div>

            {/* 2. Main Call to Action Box from sketch: "আপনাদের সমস্যা সম্পর্কে জানান নিচের বাটনে ক্লিক করে" */}
            <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
              <div className="text-center sm:text-left">
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 inline-block mb-2">
                  {language === 'bn' ? 'তাত্ক্ষণিক পদক্ষেপ' : 'Fast Response'}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-neutral-900">
                  {strings.heroActionPrompt}
                </h3>
              </div>

              {/* The Big BUTTON from sketch */}
              <div className="mt-5 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={onOpenReportModal}
                  className="w-full sm:flex-1 py-4 px-6 text-base font-extrabold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-98 rounded-2xl shadow-lg shadow-emerald-900/25 flex items-center justify-center gap-3 transition-all cursor-pointer group"
                >
                  <MessageSquareText className="w-5 h-5 text-emerald-200 group-hover:scale-110 transition-transform" />
                  <span>{strings.reportButton}</span>
                  <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={onOpenTrackModal}
                  className="w-full sm:w-auto py-4 px-6 text-sm font-bold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 active:scale-98 rounded-2xl border border-neutral-300 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
                >
                  <Search className="w-4 h-4 text-neutral-600" />
                  <span>{strings.trackButton}</span>
                </button>
              </div>

              {/* Key Trust Guarantees */}
              <div className="mt-4 pt-4 border-t border-neutral-100 grid grid-cols-3 gap-2 text-center text-[11px] text-neutral-600">
                <div className="flex flex-col items-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mb-1" />
                  <span>{language === 'bn' ? 'সরাসরি তদারকি' : 'Direct Oversight'}</span>
                </div>
                <div className="flex flex-col items-center">
                  <Clock className="w-4 h-4 text-emerald-600 mb-1" />
                  <span>{language === 'bn' ? 'ইউনিয়ন যাচাই ও সমাধান' : 'Union Inspection'}</span>
                </div>
                <div className="flex flex-col items-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1" />
                  <span>{language === 'bn' ? '১০০% গোপনীয়' : 'Anonymous Option'}</span>
                </div>
              </div>
            </div>

            {/* 3. Feature Filler: 3-Step Process & Official Helpline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Card A: 3-Step Resolution Mechanism */}
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>{language === 'bn' ? '৩ ধাপে সমাধান' : '3-Step Resolution'}</span>
                  </div>
                  <ul className="text-xs text-neutral-600 space-y-1.5">
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-emerald-700">১.</span>
                      <span>{language === 'bn' ? 'নাগরিক সমস্যা দাখিল ও ট্র্যাকিং কোড গ্রহণ' : 'Submit grievance & receive tracking ID'}</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-emerald-700">২.</span>
                      <span>{language === 'bn' ? 'ইউনিয়ন প্রতিনিধি দল কর্তৃক যাচাই ও কার্যক্রম শুরু' : 'Union inspection & field work initiation'}</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-emerald-700">৩.</span>
                      <span>{language === 'bn' ? 'সমস্যার স্থায়ী সমাধান ও স্ট্যাটাস আপডেট' : 'Problem resolved & status updated'}</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-3 pt-2 border-t border-neutral-200 flex items-center justify-between text-[11px] text-neutral-500">
                  <span>{language === 'bn' ? 'সরাসরি সেবা ডেস্ক' : 'Citizen Help Desk'}</span>
                  <span className="font-bold text-emerald-700 font-mono-num">২৪/৭ সেবা</span>
                </div>
              </div>

              {/* Card B: Live Direct Contact & Helpline Card */}
              <div className="p-4 bg-emerald-900 text-white rounded-2xl border border-emerald-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">
                    <PhoneCall className="w-4 h-4 text-amber-400" />
                    <span>{language === 'bn' ? 'জরুরি নাগরিক হেল্পলাইন' : 'Emergency Civic Hotline'}</span>
                  </div>
                  <p className="text-xs text-emerald-100">
                    {language === 'bn'
                      ? 'যেকোনো জরুরি সমস্যা বা সরাসরি কথা বলতে আমাদের অফিসে যোগাযোগ করুন:'
                      : 'For urgent matters, call our central civic response center directly:'}
                  </p>
                  <a
                    href={`tel:${leaderProfile.phone.replace(/\s+/g, '')}`}
                    className="mt-2 block text-base font-extrabold text-amber-300 font-mono-num hover:underline"
                  >
                    {leaderProfile.phone}
                  </a>
                  <a
                    href={`mailto:${leaderProfile.email}`}
                    className="text-[11px] text-emerald-200 mt-0.5 block hover:underline break-all"
                  >
                    {leaderProfile.email}
                  </a>
                </div>

                <div className="mt-3 pt-2 border-t border-emerald-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-300">{language === 'bn' ? 'মোট সমাধান' : 'Total Resolved'}:</span>
                  <span className="font-bold text-amber-300 font-mono-num">
                    {resolvedProblemsCount.toLocaleString()}
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

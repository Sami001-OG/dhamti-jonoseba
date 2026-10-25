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
            {/* The Dignified Name & Civic Designation */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 text-emerald-900 text-xs font-medium mb-3 border border-emerald-200/70">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span className="bengali-text">{leaderProfile.designation || (language === 'bn' ? 'ধামতী ইউনিয়ন সেবক' : 'Dhamti Union Representative')}</span>
              </div>
              
              {/* Leader name in calm, dignified Bengali editorial serif */}
              <h1 className="text-3xl sm:text-4xl md:text-[2.6rem] font-bold text-neutral-900 leading-[1.3] font-serif-bangla">
                {leaderProfile.name || strings.leaderGreeting}
              </h1>

              {/* Sub-promise with soothing, authentic human civic tone */}
              <p className="text-base sm:text-lg font-medium text-emerald-800/90 mt-2.5 font-serif-bangla leading-relaxed">
                {leaderProfile.promise || strings.leaderPromise}
              </p>
            </div>

            {/* Natural Stage: Leader Portrait Popping Up Seamlessly from the Slogan Plinth */}
            <div className="relative mt-8 pt-6">
              <div className="relative z-10 flex flex-col items-center">
                
                {/* Clean, authentic portrait without artificial badges or robotic overlays */}
                <div className="relative group">
                  <div className="absolute -inset-2 bg-emerald-950/10 rounded-3xl blur-md pointer-events-none"></div>

                  <div className="relative w-44 h-50 sm:w-52 sm:h-58 md:w-60 md:h-66 rounded-t-3xl overflow-hidden border-t-3 border-x-3 border-emerald-800/90 shadow-xl bg-neutral-900 flex flex-col items-center justify-end">
                    <img
                      src={leaderProfile.profileImage || LEADER_PERMANENT_PHOTO_URL}
                      alt={leaderProfile.name}
                      className="w-full h-full object-cover object-top filter contrast-[1.02] group-hover:scale-[1.01] transition-transform duration-500"
                      loading="eager"
                      decoding="async"
                    />

                    {/* Natural soft gradient blending into the slogan podium */}
                    <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-emerald-950 via-emerald-950/70 to-transparent pointer-events-none"></div>
                  </div>
                </div>

                {/* THE SLOGAN PODIUM: Pure, authentic slogan presentation without distracting labels */}
                <div className="relative z-20 -mt-2 w-full">
                  <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 text-white p-5 sm:p-6 rounded-2xl shadow-xl border border-emerald-700/80 relative overflow-hidden text-center">
                    
                    {/* Subtle warm accent trim */}
                    <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 opacity-80"></div>

                    {/* Slogan - Clean and uncluttered, no redundant 'স্লোগান' label */}
                    <p className="text-xl sm:text-2xl md:text-[1.65rem] font-bold text-white leading-relaxed break-words font-serif-bangla tracking-wide">
                      “{leaderProfile.mainSlogan}”
                    </p>
                    
                    {/* Sub Slogan */}
                    <p className="text-sm sm:text-base font-normal text-amber-200/95 mt-2 leading-relaxed break-words font-serif-bangla">
                      {leaderProfile.subSlogan}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Fills the entire right side purposefully */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6 pt-4 lg:pt-0">
            
            {/* 1. Civic Announcement: "আমরা এখানে আছি আপনাদের সমস্যা সম্পর্কে জানতে" */}
            <div className="p-5 sm:p-6 bg-gradient-to-br from-emerald-50/60 via-white to-stone-50 rounded-3xl border border-emerald-200/80 shadow-2xs relative overflow-hidden">
              <h2 className="text-xl sm:text-2xl md:text-[1.75rem] font-bold text-neutral-900 leading-snug font-serif-bangla">
                {strings.heroSlogan}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-2.5 leading-relaxed font-sans-bangla">
                {language === 'bn'
                  ? 'আপনার এলাকার যেকোনো দুর্ভোগ বা উন্নয়ন প্রয়োজনের কথা সরাসরি জানান। প্রতিটি আবেদন পর্যবেক্ষণ করে সর্বোচ্চ গুরুত্বের সাথে সমাধান করা হবে।'
                  : 'Report any infrastructure, water, sanitation, or safety issue in your ward. Every submission is directly inspected and acted upon.'}
              </p>
            </div>

            {/* 2. Main Call to Action Box */}
            <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs">
              <div className="text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-bold text-neutral-900 font-serif-bangla">
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

            {/* 3. Official Civic Helpline & Direct Contact */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-3xl border border-emerald-800 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5">
                    <PhoneCall className="w-4 h-4 text-amber-400" />
                    <span>{language === 'bn' ? 'জরুরি নাগরিক হেল্পলাইন ও পরামর্শ কেন্দ্র' : 'Direct Civic Helpline'}</span>
                  </div>
                  <p className="text-xs text-emerald-100 max-w-md leading-relaxed font-sans-bangla">
                    {language === 'bn'
                      ? 'ধামতীর যেকোনো সমস্যা, পরামর্শ বা সরাসরি যোগাযোগে আমাদের সাথে যুক্ত হোন:'
                      : 'For immediate assistance, advice, or community inquiries, contact directly:'}
                  </p>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-800/80">
                  <a
                    href={`tel:${leaderProfile.phone.replace(/\s+/g, '')}`}
                    className="text-lg sm:text-xl font-extrabold text-amber-300 font-mono-num hover:underline"
                  >
                    {leaderProfile.phone}
                  </a>
                  <a
                    href={`mailto:${leaderProfile.email}`}
                    className="text-xs text-emerald-200 hover:text-white hover:underline transition-colors break-all"
                  >
                    {leaderProfile.email}
                  </a>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-800/80 flex flex-col min-[480px]:flex-row items-start min-[480px]:items-center justify-between gap-2 text-[11px] text-emerald-300">
                <span>{leaderProfile.officeAddress}</span>
                <span className="font-semibold text-amber-300 bg-emerald-900/90 px-2.5 py-0.5 rounded-full border border-emerald-700/60">
                  {language === 'bn' ? 'সর্বদা জনগণের পাশে' : 'Dedicated Civic Service'}
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

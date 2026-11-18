import React from 'react';
import { MessageSquareText, Search, PhoneCall } from 'lucide-react';
import { Language } from '../types';

interface MobileActionBarProps {
  language: Language;
  phone: string;
  onOpenReportModal: () => void;
  onOpenTrackModal: () => void;
}

/**
 * ফোনের নিচে স্থায়ী তিনটি বড় বাটন (বুড়ো আঙুলের নাগালে)।
 * বড় লেখা + আইকন, যেন কম পড়তে-জানা মানুষও বুঝতে পারেন।
 */
export const MobileActionBar: React.FC<MobileActionBarProps> = ({
  language,
  phone,
  onOpenReportModal,
  onOpenTrackModal,
}) => {
  const bn = language === 'bn';
  return (
    <nav
      aria-label={bn ? 'দ্রুত কাজ' : 'Quick actions'}
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-neutral-200 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="grid grid-cols-[1.6fr_1fr_1fr] gap-2">
        <button
          type="button"
          onClick={onOpenReportModal}
          className="min-h-14 rounded-2xl bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-base flex flex-col items-center justify-center gap-0.5 cursor-pointer"
        >
          <MessageSquareText className="w-6 h-6" aria-hidden="true" />
          <span>{bn ? 'সমস্যা জানান' : 'Report'}</span>
        </button>
        <button
          type="button"
          onClick={onOpenTrackModal}
          className="min-h-14 rounded-2xl bg-neutral-100 active:bg-neutral-200 border border-neutral-300 text-neutral-900 font-bold text-sm flex flex-col items-center justify-center gap-0.5 cursor-pointer"
        >
          <Search className="w-6 h-6 text-emerald-700" aria-hidden="true" />
          <span>{bn ? 'অবস্থা দেখুন' : 'Track'}</span>
        </button>
        <a
          href={`tel:${phone.replace(/\s+/g, '')}`}
          className="min-h-14 rounded-2xl bg-amber-400 active:bg-amber-500 text-neutral-950 font-bold text-sm flex flex-col items-center justify-center gap-0.5"
        >
          <PhoneCall className="w-6 h-6" aria-hidden="true" />
          <span>{bn ? 'ফোন করুন' : 'Call'}</span>
        </a>
      </div>
    </nav>
  );
};

import React, { useState } from 'react';
import { Language, ProblemReport } from '../types';
import { UI_STRINGS } from '../data/mockData';
import { X, Search, CheckCircle2, Clock, AlertCircle, MapPin, Calendar, UserCheck, Smartphone } from 'lucide-react';
import { readMyCodes } from '../services/myReports';
import { api } from '../services/api';

interface TrackProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  problems: ProblemReport[];
}

export const TrackProblemModal: React.FC<TrackProblemModalProps> = ({
  isOpen,
  onClose,
  language,
  problems,
}) => {
  const strings = UI_STRINGS[language];
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<ProblemReport | null>(null);
  const [results, setResults] = useState<ProblemReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  if (!isOpen) return null;

  // এই ফোন থেকে জমা দেওয়া অভিযোগ (কোড মনে রাখতে বা লিখতে হয় না)
  const myReports = readMyCodes()
    .map((code) => problems.find((p) => p.trackingCode === code))
    .filter((p): p is ProblemReport => Boolean(p));

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    setSearched(false);
    setSearchError('');
    setLoading(true);
    try {
      // মোবাইল নম্বর বা ট্র্যাকিং কোড, দুটোই সার্ভার চিনে নেয় (বাংলা অঙ্কেও চলে)
      const list = await api.track(query.trim());
      setResults(list);
      setResult(list[0] || null);
    } catch (err) {
      setResults([]);
      setResult(null);
      setSearchError(
        err instanceof Error && err.message
          ? err.message
          : language === 'bn'
          ? 'ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।'
          : 'Network problem. Please try again.'
      );
    } finally {
      setSearched(true);
      setLoading(false);
    }
  };

  // অবস্থার ধাপ: গৃহীত → যাচাই → কাজ চলছে → সমাধান
  const STEPS: { id: string; bn: string; en: string }[] = [
    { id: 'pending', bn: 'গৃহীত', en: 'Received' },
    { id: 'reviewing', bn: 'যাচাই চলছে', en: 'Reviewing' },
    { id: 'in_progress', bn: 'কাজ চলছে', en: 'In progress' },
    { id: 'resolved', bn: 'সমাধান', en: 'Resolved' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {language === 'bn' ? 'সমাধান সম্পন্ন' : 'Resolved'}
          </span>
        );
      case 'in_progress':
        return (
          <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
            <Clock className="w-4 h-4 text-amber-600" />
            {language === 'bn' ? 'কার্যক্রম চলমান' : 'In Progress'}
          </span>
        );
      case 'reviewing':
        return (
          <span className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
            <Clock className="w-4 h-4 text-blue-600" />
            {language === 'bn' ? 'যাচাই করা হচ্ছে' : 'Under Review'}
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-xs font-bold text-neutral-600">
            <AlertCircle className="w-4 h-4 text-neutral-500" />
            {language === 'bn' ? 'অপেক্ষমাণ' : 'Pending'}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="relative bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full shadow-2xl border border-neutral-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 sm:py-5 bg-neutral-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base sm:text-lg font-bold font-serif-bangla leading-snug">
              {strings.trackModalTitle}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Box & Body */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={strings.trackInputPlaceholder}
              className="flex-1 min-w-0 px-3 sm:px-4 py-3 text-base bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 disabled:opacity-60 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-base rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              {loading ? (language === 'bn' ? 'খোঁজা হচ্ছে…' : 'Searching…') : strings.searchBtn}
            </button>
          </form>

          {/* Quick Guidance Hint */}
          <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
            {language === 'bn'
              ? 'অভিযোগ করার সময় যে মোবাইল নম্বর দিয়েছিলেন সেটি লিখুন, অথবা ট্র্যাকিং কোড (যেমন JNS-2026-1234) লিখুন।'
              : 'Enter the mobile number you used when reporting, or your tracking code (e.g. JNS-2026-1234).'}
          </p>

          {/* এই ফোন থেকে জমা দেওয়া অভিযোগ */}
          {myReports.length > 0 && (
            <div className="mt-5">
              <div className="flex items-center gap-1.5 text-sm font-bold text-neutral-800 mb-2">
                <Smartphone className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                <span>{language === 'bn' ? 'এই ফোন থেকে আপনার জমা দেওয়া' : 'Submitted from this phone'}</span>
              </div>
              <div className="space-y-2">
                {myReports.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSearched(true);
                      setSearchError('');
                      setQuery(p.trackingCode);
                      setResults([p]);
                      setResult(p);
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl border border-neutral-200 bg-white hover:bg-emerald-50 active:bg-emerald-50 cursor-pointer flex items-center justify-between gap-3"
                  >
                    <span className="min-w-0">
                      <span className="block text-base font-semibold text-neutral-900 truncate">{p.title}</span>
                      <span className="block text-xs font-mono text-neutral-500">{p.trackingCode}</span>
                    </span>
                    <span className="shrink-0">{getStatusBadge(p.status)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Result Area */}
          {searchError && (
            <div className="mt-5 p-4 rounded-2xl border border-red-200 bg-red-50 text-red-800 text-sm font-semibold">
              {searchError}
            </div>
          )}

          {searched && !result && !searchError && (
            <div className="mt-6 p-6 text-center bg-neutral-50 rounded-2xl border border-neutral-200">
              <AlertCircle className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-base font-semibold text-neutral-800">
                {language === 'bn' ? 'এই নম্বর বা কোডে কোনো অভিযোগ পাওয়া যায়নি।' : 'No report found for this number or code.'}
              </p>
              <p className="text-sm text-neutral-500 mt-1">
                {language === 'bn'
                  ? 'অভিযোগের সময় যে নম্বর দিয়েছিলেন ঠিক সেটি লিখুন, অথবা ট্র্যাকিং কোড দিন।'
                  : 'Use the exact number you reported with, or your tracking code.'}
              </p>
            </div>
          )}

          {results.length > 1 && (
            <div className="mt-5">
              <p className="text-sm font-bold text-neutral-800 mb-2">
                {language === 'bn' ? `এই নম্বরে ${results.length}টি অভিযোগ পাওয়া গেছে, বেছে নিন:` : `${results.length} reports found, choose one:`}
              </p>
              <div className="space-y-2">
                {results.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setResult(p)}
                    className={`w-full text-left px-4 py-3 rounded-xl border cursor-pointer flex items-center justify-between gap-3 ${
                      result?.id === p.id ? 'border-emerald-600 bg-emerald-50' : 'border-neutral-200 bg-white hover:bg-neutral-50'
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block text-base font-semibold text-neutral-900 truncate">{p.title}</span>
                      <span className="block text-xs font-mono text-neutral-500">{p.trackingCode}</span>
                    </span>
                    <span className="shrink-0">{getStatusBadge(p.status)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {result && (
            <div className="mt-6 p-5 bg-neutral-50/70 rounded-2xl border border-neutral-200 space-y-4">
              
              {/* Top Details */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-200">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      result.submissionType === 'advice' ? 'bg-indigo-600 text-white' : 'bg-emerald-700 text-white'
                    }`}>
                      {result.submissionType === 'advice' ? (language === 'bn' ? 'উপদেশ ও পরামর্শ' : 'Advice') : (language === 'bn' ? 'অভিযোগ' : 'Complaint')}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-800">
                      {result.trackingCode}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-neutral-900 mt-0.5">
                    {result.title}
                  </h4>
                </div>
                <div>
                  {getStatusBadge(result.status)}
                </div>
              </div>

              {/* অগ্রগতির ধাপ */}
              <div>
                <p className="text-sm font-bold text-neutral-800 mb-3">
                  {language === 'bn' ? 'আপনার অভিযোগ এখন যে ধাপে আছে' : 'Where your report stands now'}
                </p>
                <ol className="grid grid-cols-4 gap-1">
                  {STEPS.map((st, i) => {
                    const current = Math.max(0, STEPS.findIndex((x) => x.id === result.status));
                    const done = i <= current;
                    const isNow = i === current;
                    return (
                      <li key={st.id} className="flex flex-col items-center text-center">
                        <div className="flex items-center w-full">
                          <span className={`flex-1 h-1 ${i === 0 ? 'bg-transparent' : done ? 'bg-emerald-600' : 'bg-neutral-200'}`} />
                          <span
                            className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${
                              done ? 'bg-emerald-700 text-white' : 'bg-neutral-200 text-neutral-500'
                            } ${isNow ? 'ring-4 ring-emerald-200' : ''}`}
                          >
                            {done ? '✓' : i + 1}
                          </span>
                          <span className={`flex-1 h-1 ${i === STEPS.length - 1 ? 'bg-transparent' : i < current ? 'bg-emerald-600' : 'bg-neutral-200'}`} />
                        </div>
                        <span className={`mt-1.5 text-xs leading-tight ${isNow ? 'font-bold text-emerald-800' : 'text-neutral-600'}`}>
                          {language === 'bn' ? st.bn : st.en}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>

              {/* Location & Info */}
              <div className="text-xs text-neutral-600 space-y-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{result.specificLocation}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{new Date(result.createdAt).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}</span>
                </div>
                {result.assignedOfficer && (
                  <div className="flex items-center gap-1.5 text-neutral-800 font-medium pt-1">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{strings.assignedTo}: {result.assignedOfficer}</span>
                  </div>
                )}
              </div>

              {/* Resolution Note */}
              {result.resolutionNote && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950">
                  <span className="font-bold block mb-0.5">{strings.officialNotes}:</span>
                  {result.resolutionNote}
                </div>
              )}

              {/* Timeline Steps */}
              <div className="pt-3 border-t border-neutral-200">
                <h5 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-3">
                  {language === 'bn' ? 'পদক্ষেপের ইতিহাস' : 'Action Timeline'}
                </h5>
                <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-neutral-200">
                  {result.timeline.map((step, idx) => (
                    <div key={step.id || idx} className="relative flex items-start gap-3 pl-1">
                      <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold z-10 shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 bg-white p-2.5 rounded-xl border border-neutral-200 text-xs shadow-2xs">
                        <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                          <span className="font-semibold text-neutral-700">{step.author}</span>
                          <span>{new Date(step.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-neutral-700">
                          {language === 'bn' ? step.noteBn : step.noteEn}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

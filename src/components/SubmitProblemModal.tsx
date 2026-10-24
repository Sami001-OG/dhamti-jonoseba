import React, { useState } from 'react';
import { AreaStat, CategoryStat, Language, ProblemReport, SubmissionType, UrgencyLevel } from '../types';
import { UI_STRINGS } from '../data/mockData';
import { X, Check, Copy, MessageSquareText, ShieldCheck, CheckCircle2, Lightbulb, AlertTriangle } from 'lucide-react';
import { sanitizeString, sanitizePhoneNumber } from '../services/security';

interface SubmitProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  areas: AreaStat[];
  categories: CategoryStat[];
  onSubmit: (problem: ProblemReport) => void;
}

export const SubmitProblemModal: React.FC<SubmitProblemModalProps> = ({
  isOpen,
  onClose,
  language,
  areas,
  categories,
  onSubmit,
}) => {
  const strings = UI_STRINGS[language];

  // Submission Type: complaint (অভিযোগ) vs advice (উপদেশ / পরামর্শ)
  const [submissionType, setSubmissionType] = useState<SubmissionType>('complaint');

  const [citizenName, setCitizenName] = useState('');
  const [phone, setPhone] = useState('');
  const [ward, setWard] = useState(areas[0]?.wardNumber || 'ward-01');
  const [category, setCategory] = useState(categories[0]?.id || 'road');
  const [specificLocation, setSpecificLocation] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('normal');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const isAdvice = submissionType === 'advice';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanTitle = sanitizeString(title, 120);
    const cleanDesc = sanitizeString(description, 1000);
    const cleanLocation = sanitizeString(specificLocation, 150);
    const cleanName = sanitizeString(citizenName, 60);
    const cleanPhone = isAnonymous ? '' : sanitizePhoneNumber(phone);

    if (!cleanTitle) {
      setErrorMsg(
        isAdvice
          ? language === 'bn'
            ? 'অনুগ্রহ করে উপদেশ বা পরামর্শের বিষয় লিখুন।'
            : 'Please provide a subject for your advice.'
          : language === 'bn'
          ? 'অনুগ্রহ করে সমস্যার শিরোনাম দিন।'
          : 'Please provide an issue title.'
      );
      return;
    }

    if (!cleanDesc) {
      setErrorMsg(
        isAdvice
          ? language === 'bn'
            ? 'অনুগ্রহ করে আপনার মূল্যবান উপদেশ বা পরামর্শ বিস্তারিত লিখুন।'
            : 'Please write your advice details.'
          : language === 'bn'
          ? 'অনুগ্রহ করে সমস্যার বিবরণ বিস্তারিত লিখুন।'
          : 'Please describe the problem.'
      );
      return;
    }

    if (!cleanLocation) {
      setErrorMsg(
        isAdvice
          ? language === 'bn'
            ? 'সংশ্লিষ্ট এলাকা বা প্রসঙ্গের বিবরণ দিন (যেমন: সমগ্র ধামতী বা নির্দিষ্ট মোড়)।'
            : 'Please mention relevant area or scope.'
          : language === 'bn'
          ? 'নির্দিষ্ট সড়ক বা এলাকার বিবরণ দিন।'
          : 'Please provide specific location/landmark.'
      );
      return;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    // Distinct prefix: ADV for advice, JNS for complaints
    const trackingCode = isAdvice ? `ADV-2026-${randomSuffix}` : `JNS-2026-${randomSuffix}`;
    const newId = `${isAdvice ? 'adv' : 'prob'}-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const newProblem: ProblemReport = {
      id: newId,
      trackingCode,
      submissionType,
      title: cleanTitle,
      description: cleanDesc,
      category,
      ward,
      specificLocation: cleanLocation,
      citizenName: isAnonymous
        ? language === 'bn'
          ? 'গোপন নাগরিক'
          : 'Anonymous Citizen'
        : cleanName || (language === 'bn' ? 'এলাকাবাসী' : 'Local Resident'),
      phone: cleanPhone,
      isAnonymous,
      urgency,
      status: 'pending',
      createdAt: nowIso,
      upvotes: 1,
      userUpvoted: true,
      timeline: [
        {
          id: `t-${Date.now()}-1`,
          timestamp: nowIso,
          status: 'pending',
          noteBn: isAdvice
            ? 'নাগরিকের মূল্যবান উপদেশ ও পরামর্শ জনসেবা সিস্টেমে গৃহীত হয়েছে। নেতৃত্বের পর্যালোচনার অপেক্ষায়।'
            : 'নাগরিকের অভিযোগটি জনসেবা সিস্টেমে গৃহীত হয়েছে। প্রাথমিক পর্যালোচনার অপেক্ষায়।',
          noteEn: isAdvice
            ? 'Citizen advice & suggestion registered in Jonoseba portal. Awaiting leadership review.'
            : 'Grievance received in Jonoseba portal. Awaiting team initial inspection.',
          author: 'জনসেবা সিস্টেম',
        },
      ],
    };

    onSubmit(newProblem);
    setSubmittedCode(trackingCode);
  };

  const handleCopyCode = () => {
    if (submittedCode) {
      navigator.clipboard.writeText(submittedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedCode(null);
    setSubmissionType('complaint');
    setCitizenName('');
    setPhone('');
    setTitle('');
    setDescription('');
    setSpecificLocation('');
    setUrgency('normal');
    setIsAnonymous(false);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="relative bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full shadow-2xl border border-neutral-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header Bar */}
        <div
          className={`px-5 sm:px-6 py-4 sm:py-5 text-white flex items-center justify-between shrink-0 transition-colors ${
            isAdvice
              ? 'bg-gradient-to-r from-blue-800 to-indigo-900'
              : 'bg-gradient-to-r from-emerald-800 to-emerald-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              {isAdvice ? (
                <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
              ) : (
                <MessageSquareText className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-200" />
              )}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-serif-bangla leading-snug">
                {submittedCode
                  ? isAdvice
                    ? language === 'bn'
                      ? 'পরামর্শ সফলভাবে গৃহীত হয়েছে!'
                      : 'Advice Successfully Registered!'
                    : strings.trackingSuccessTitle
                  : isAdvice
                  ? language === 'bn'
                    ? 'আপনার মূল্যবান উপদেশ / পরামর্শ দিন'
                    : 'Share Your Advice or Suggestion'
                  : strings.submitTitle}
              </h3>
              <p className="text-[11px] sm:text-xs text-white/80">
                {language === 'bn' ? 'মোঃ আনোয়ার হোসেন ভূঁইয়ার সেবাদল' : 'Direct Action Team of Md. Anwar Hossain Bhuiyan'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedCode ? (
          /* Submission Success State */
          <div className="p-8 text-center">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isAdvice ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-neutral-900">
              {isAdvice
                ? language === 'bn'
                  ? 'আপনার উপদেশ ও পরামর্শ সাফল্যের সাথে গৃহীত হয়েছে!'
                  : 'Advice Successfully Submitted!'
                : language === 'bn'
                ? 'আপনার অভিযোগ সাফল্যের সাথে গৃহীত হয়েছে!'
                : 'Report Successfully Submitted!'}
            </h4>
            <p className="text-sm text-neutral-600 mt-2 max-w-md mx-auto">
              {isAdvice
                ? language === 'bn'
                  ? 'ধামতী ইউনিয়নকে আরও উন্নত ও সমৃদ্ধ করতে আপনার সুচিন্তিত পরামর্শের জন্য আন্তরিক ধন্যবাদ। মোঃ আনোয়ার হোসেন ভূঁইয়া ও তাঁর দল এটি গুরুত্বসহকারে বিবেচনা করবেন।'
                  : 'Thank you for your valuable guidance towards developing Dhamti Union. Our civic leadership will review it with highest priority.'
                : language === 'bn'
                ? 'মোঃ আনোয়ার হোসেন ভূঁইয়ার টিম দ্রুত আপনার দেওয়া তথ্য যাচাই করে কার্যকরী পদক্ষেপ গ্রহণ করবে।'
                : 'Our civic response squad will inspect this site and begin necessary community work.'}
            </p>

            <div className="mt-6 p-5 bg-neutral-50 rounded-2xl border border-neutral-200 max-w-sm mx-auto">
              <span className="text-xs text-neutral-500 font-medium block">
                {strings.trackingSuccessDesc}
              </span>
              <div className="flex items-center justify-center gap-3 mt-2">
                <span className="text-2xl font-extrabold text-neutral-900 font-mono-num tracking-wider">
                  {submittedCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-2 rounded-lg bg-white border border-neutral-300 hover:bg-neutral-100 transition-colors text-neutral-700"
                  title={strings.copyCode}
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              {copied && (
                <span className="text-xs text-emerald-600 font-semibold block mt-1">
                  {strings.copied}
                </span>
              )}
            </div>

            <div className="mt-8 flex justify-center gap-3">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                {language === 'bn' ? 'সমাপ্ত করুন' : 'Done'}
              </button>
            </div>
          </div>
        ) : (
          /* The Form */
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5 flex-1 overflow-y-auto">
            
            {/* SUBMISSION TYPE TOGGLE: অভিযোগ vs উপদেশ */}
            <div className="p-1 bg-neutral-100 rounded-xl border border-neutral-200 flex items-center">
              <button
                type="button"
                onClick={() => setSubmissionType('complaint')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  !isAdvice
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>{language === 'bn' ? 'অভিযোগ দাখিল (Complaint)' : 'Grievance / Complaint'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSubmissionType('advice')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isAdvice
                    ? 'bg-indigo-700 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Lightbulb className="w-4 h-4 text-amber-300" />
                <span>{language === 'bn' ? 'উপদেশ ও পরামর্শ (Advice)' : 'Advice / Suggestion'}</span>
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* Ward & Category in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  {isAdvice
                    ? language === 'bn'
                      ? 'সম্পর্কিত ওয়ার্ড / এলাকা'
                      : 'Target Ward / Area'
                    : strings.formWard}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                >
                  {areas.map((a) => (
                    <option key={a.wardNumber} value={a.wardNumber}>
                      {language === 'bn' ? a.wardNameBn : a.wardNameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  {isAdvice
                    ? language === 'bn'
                      ? 'পরামর্শের খাত / বিষয়'
                      : 'Category of Suggestion'
                    : strings.formCategory}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {language === 'bn' ? c.nameBn : c.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                {isAdvice
                  ? language === 'bn'
                    ? 'উপদেশ বা পরামর্শের বিষয় / শিরোনাম'
                    : 'Advice Subject / Title'
                  : strings.formTitle}{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  isAdvice
                    ? language === 'bn'
                      ? 'যেমন: ধামতী বাজারে প্লাস্টিক বর্জ্য রোধে সচেতনতা ও ডাস্টবিন বসানোর প্রস্তাব'
                      : 'e.g. Setting up waste bins and green campaign in Dhamti Bazaar'
                    : language === 'bn'
                    ? 'যেমন: প্রধান সড়কে বিপজ্জনক গর্ত ও ড্রেন ভাঙা'
                    : 'e.g. Broken drain slab and heavy road ditch'
                }
                className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>

            {/* Specific Location or Context */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                {isAdvice
                  ? language === 'bn'
                    ? 'সংশ্লিষ্ট সড়ক, মোড় বা আওতাভুক্ত এলাকা'
                    : 'Relevant Location or Scope'
                  : strings.formLocation}{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={specificLocation}
                onChange={(e) => setSpecificLocation(e.target.value)}
                placeholder={
                  isAdvice
                    ? language === 'bn'
                      ? 'যেমন: সমগ্র ইউনিয়ন / ধামতী বাজার ও মাদ্রাসা রোড'
                      : 'e.g. Whole Union / Dhamti Bazaar and College Road'
                    : language === 'bn'
                    ? 'যেমন: শান্তিনগর প্রাথমিক স্কুলের সামনে'
                    : 'e.g. In front of Shantinagar Primary School'
                }
                className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>

            {/* Detailed Description */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                {isAdvice
                  ? language === 'bn'
                    ? 'আপনার সুচিন্তিত উপদেশ ও বিস্তারিত প্রস্তাবনা'
                    : 'Detailed Advice & Recommendation'
                  : strings.formDesc}{' '}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  isAdvice
                    ? language === 'bn'
                      ? 'এলাকার উন্নয়ন, সুশাসন ও নাগরিক সেবাকে সমৃদ্ধ করতে আপনার সুচিন্তিত মতামত ও বাস্তবায়ন উপায় লিখুন...'
                      : 'Provide details on your suggestion and how it can benefit the community...'
                    : language === 'bn'
                    ? 'সমস্যার মাত্রা, দুর্ভোগ এবং দ্রুত কী করা প্রয়োজন তা বিস্তারিত লিখুন...'
                    : 'Describe how this impacts residents and what immediate action is required...'
                }
                className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>

            {/* Urgency / Priority Selector */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                {isAdvice
                  ? language === 'bn'
                    ? 'প্রস্তাবনার গুরুত্ব / প্রভাবের পরিধি'
                    : 'Impact / Priority Level'
                  : strings.formUrgency}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    id: 'normal',
                    labelBn: isAdvice ? 'সাধারণ পরামর্শ' : 'স্বাভাবিক',
                    labelEn: isAdvice ? 'General Advice' : 'Normal',
                  },
                  {
                    id: 'high',
                    labelBn: isAdvice ? 'গুরুত্বপূর্ণ উন্নয়ন' : 'উচ্চ অগ্রাধিকার',
                    labelEn: isAdvice ? 'High Impact' : 'High Priority',
                  },
                  {
                    id: 'critical',
                    labelBn: isAdvice ? 'জরুরি সংস্কার' : 'জরুরি / বিপজ্জনক',
                    labelEn: isAdvice ? 'Urgent Reform' : 'Critical',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setUrgency(item.id as UrgencyLevel)}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border text-center transition-all cursor-pointer ${
                      urgency === item.id
                        ? item.id === 'critical'
                          ? 'bg-red-50 border-red-500 text-red-700 font-bold'
                          : isAdvice
                          ? 'bg-indigo-50 border-indigo-600 text-indigo-900 font-bold'
                          : 'bg-emerald-50 border-emerald-600 text-emerald-800 font-bold'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    {language === 'bn' ? item.labelBn : item.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Citizen Info & Anonymous Switch */}
            <div className="pt-2 border-t border-neutral-200/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-neutral-800">
                  {language === 'bn' ? 'যোগাযোগের তথ্য' : 'Contact Information'}
                </span>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-600">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span>
                    {isAdvice
                      ? language === 'bn'
                        ? 'পরামর্শকারীর নাম গোপন রাখুন'
                        : 'Keep name confidential'
                      : strings.formAnonymous}
                  </span>
                </label>
              </div>

              {!isAnonymous && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      {strings.formFullName}
                    </label>
                    <input
                      type="text"
                      value={citizenName}
                      onChange={(e) => setCitizenName(e.target.value)}
                      placeholder={language === 'bn' ? 'আপনার নাম' : 'Your Name'}
                      className="w-full px-3.5 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      {strings.formPhone}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={language === 'bn' ? '০১৭১২-XXXXXX' : '01712-XXXXXX'}
                      className="w-full px-3.5 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-5 py-2.5 text-sm font-semibold text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
              >
                {strings.cancel}
              </button>
              <button
                type="submit"
                className={`px-6 py-2.5 text-sm font-bold text-white active:scale-95 rounded-xl shadow-sm transition-all cursor-pointer ${
                  isAdvice
                    ? 'bg-indigo-700 hover:bg-indigo-800'
                    : 'bg-emerald-700 hover:bg-emerald-800'
                }`}
              >
                {isAdvice
                  ? language === 'bn'
                    ? 'উপদেশ ও পরামর্শ দাখিল করুন'
                    : 'Submit Advice'
                  : strings.submitNow}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

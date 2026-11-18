import React, { useState, useMemo } from 'react';
import { ProblemReport, AreaStat, CategoryStat, Language, ProblemStatus } from '../types';
import { UI_STRINGS } from '../data/mockData';
import { 
  Search, 
  ThumbsUp, 
  Eye, 
  MapPin, 
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';

interface ProblemFeedSectionProps {
  language: Language;
  problems: ProblemReport[];
  areas: AreaStat[];
  categories: CategoryStat[];
  selectedWard: string;
  onSelectWard: (ward: string) => void;
  onUpvote: (id: string) => void;
  onViewDetails: (problem: ProblemReport) => void;
}

export const ProblemFeedSection: React.FC<ProblemFeedSectionProps> = ({
  language,
  problems,
  areas,
  categories,
  selectedWard,
  onSelectWard,
  onUpvote,
  onViewDetails,
}) => {
  const strings = UI_STRINGS[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'complaint' | 'advice'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Counts
  const complaintsCount = problems.filter((p) => p.submissionType !== 'advice').length;
  const adviceCount = problems.filter((p) => p.submissionType === 'advice').length;

  const filteredProblems = useMemo(() => {
    return problems.filter((item) => {
      // Type filter (complaint vs advice)
      if (selectedType === 'complaint' && item.submissionType === 'advice') {
        return false;
      }
      if (selectedType === 'advice' && item.submissionType !== 'advice') {
        return false;
      }
      // Ward filter
      if (selectedWard && item.ward !== selectedWard) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'all' && item.status !== selectedStatus) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesLocation = item.specificLocation.toLowerCase().includes(query);
        const matchesCode = item.trackingCode.toLowerCase().includes(query);
        const matchesName = !item.isAnonymous && item.citizenName.toLowerCase().includes(query);
        return matchesTitle || matchesDesc || matchesLocation || matchesCode || matchesName;
      }
      return true;
    });
  }, [problems, selectedType, selectedWard, selectedCategory, selectedStatus, searchQuery]);

  const getStatusLabel = (status: ProblemStatus, isAdvice: boolean) => {
    switch (status) {
      case 'resolved':
        return isAdvice
          ? language === 'bn'
            ? 'পরামর্শ বাস্তবায়িত'
            : 'Advice Implemented'
          : language === 'bn'
          ? 'সমাধান সম্পন্ন'
          : 'Resolved';
      case 'in_progress':
        return isAdvice
          ? language === 'bn'
            ? 'বাস্তবায়ন বিবেচনাধীন'
            : 'Under Execution'
          : language === 'bn'
          ? 'কার্যক্রম চলমান'
          : 'Ongoing';
      case 'reviewing':
        return language === 'bn' ? 'ইউনিয়ন কর্তৃক যাচাই চলছে' : 'Checking by Union';
      case 'pending':
        return isAdvice
          ? language === 'bn'
            ? 'নতুন পরামর্শ'
            : 'New Advice'
          : language === 'bn'
          ? 'নতুন অভিযোগ'
          : 'New Grievance';
      default:
        return status;
    }
  };

  const getUrgencyText = (urgency: string, isAdvice: boolean) => {
    switch (urgency) {
      case 'critical':
        return isAdvice
          ? language === 'bn'
            ? 'জরুরি প্রস্তাব'
            : 'High Impact'
          : language === 'bn'
          ? 'জরুরি'
          : 'Critical';
      case 'high':
        return language === 'bn' ? 'উচ্চ অগ্রাধিকার' : 'High Priority';
      default:
        return language === 'bn' ? 'স্বাভাবিক' : 'Normal';
    }
  };

  const getWardName = (wardId: string) => {
    const area = areas.find((a) => a.wardNumber === wardId);
    if (!area) return wardId;
    return language === 'bn' ? area.wardNameBn : area.wardNameEn;
  };

  const getCategoryName = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return catId;
    return language === 'bn' ? cat.nameBn : cat.nameEn;
  };

  return (
    <section id="problem-feed" className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
              {language === 'bn' ? 'নাগরিক মতামত, অভিযোগ ও স্বচ্ছ নজরদারি' : 'Citizen Grievance & Advice Feed'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mt-1 font-serif-bangla">
              {language === 'bn' ? 'ধামতীবাসীর সাম্প্রতিক অভিযোগ ও উন্নয়ন পরামর্শ' : 'Dhamti Citizen Grievances & Advice Feed'}
            </h2>
            <p className="text-sm text-neutral-600 mt-1.5">
              {language === 'bn'
                ? 'আপনার এলাকার অভিযোগ বা পরামর্শ খুঁজুন এবং সমাধানের বাস্তব অগ্রগতি পর্যবেক্ষণ করুন'
                : 'Browse reported civic grievances & citizen suggestions with real resolution tracking'}
            </p>
          </div>

          <div className="text-sm text-neutral-500 font-mono-num font-medium">
            {language === 'bn' 
              ? `মোট প্রাপ্ত: ${filteredProblems.length} টি বার্তা` 
              : `Showing: ${filteredProblems.length} submissions`}
          </div>
        </div>

        {/* PRIMARY TYPE SELECTOR: All vs Complaints vs Advice */}
        <div className="flex items-center gap-2 mb-4 p-1.5 bg-neutral-100 rounded-2xl max-w-md">
          <button
            type="button"
            onClick={() => setSelectedType('all')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              selectedType === 'all'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'সকল' : 'All'}</span>
            <span className="text-xs opacity-80">({problems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('complaint')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              selectedType === 'complaint'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'অভিযোগ' : 'Complaints'}</span>
            <span className="text-xs opacity-80">({complaintsCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('advice')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              selectedType === 'advice'
                ? 'bg-indigo-700 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
            <span>{language === 'bn' ? 'উপদেশ' : 'Advice'}</span>
            <span className="text-xs opacity-80">({adviceCount})</span>
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 mb-8 space-y-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  language === 'bn'
                    ? 'অভিযোগ, উপদেশ, এলাকা বা ট্র্যাকিং কোড দিয়ে খুঁজুন...'
                    : 'Search by issue, advice, location or tracking code...'
                }
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-700"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Ward Select */}
            <div className="w-full sm:w-60">
              <select
                value={selectedWard}
                onChange={(e) => onSelectWard(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              >
                <option value="">{strings.allWards}</option>
                {areas.map((area) => (
                  <option key={area.wardNumber} value={area.wardNumber}>
                    {language === 'bn' ? area.wardNameBn : area.wardNameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Select */}
            <div className="w-full sm:w-52">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              >
                <option value="all">{strings.allCategories}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {language === 'bn' ? cat.nameBn : cat.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-neutral-200/60">
            <span className="text-xs font-medium text-neutral-500 mr-1">
              {language === 'bn' ? 'অবস্থা:' : 'Status:'}
            </span>
            {[
              { id: 'all', label: strings.allStatuses },
              { id: 'pending', label: strings.pending },
              { id: 'reviewing', label: strings.reviewing },
              { id: 'in_progress', label: strings.in_progress },
              { id: 'resolved', label: strings.resolved },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  selectedStatus === tab.id
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Problems & Advice List */}
        {filteredProblems.length === 0 ? (
          <div className="text-center py-16 bg-neutral-50 rounded-2xl border border-neutral-200 p-8">
            <HelpCircle className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-neutral-900">
              {language === 'bn' ? 'কোনো তথ্য পাওয়া যায়নি' : 'No matching records found'}
            </h3>
            <p className="text-sm text-neutral-500 mt-1 max-w-sm mx-auto">
              {language === 'bn'
                ? 'ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন অথবা আপনার এলাকার অভিযোগ বা উপদেশ জানান।'
                : 'Try adjusting your search filters or submit a new grievance or advice.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProblems.map((item) => {
              const formattedDate = new Date(item.createdAt).toLocaleDateString(
                language === 'bn' ? 'bn-BD' : 'en-US',
                { month: 'short', day: 'numeric', year: 'numeric' }
              );
              const isAdvice = item.submissionType === 'advice';

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border p-5 sm:p-6 hover:border-neutral-300 transition-all shadow-xs ${
                    isAdvice ? 'border-indigo-100 bg-gradient-to-r from-indigo-50/20 to-white' : 'border-neutral-200'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    
                    {/* Left: Content */}
                    <div className="flex-1">
                      
                      {/* Zero-pill metadata line with clean typographic dot separators */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 mb-2.5">
                        
                        {/* Type Indicator - Clean unboxed text with status dot */}
                        <span className={`inline-flex items-center gap-1.5 font-bold text-xs ${
                          isAdvice ? 'text-indigo-800' : 'text-emerald-800'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${isAdvice ? 'bg-indigo-600' : 'bg-emerald-600'}`} />
                          <span>{isAdvice ? (language === 'bn' ? 'উপদেশ ও পরামর্শ' : 'Advice') : (language === 'bn' ? 'অভিযোগ' : 'Complaint')}</span>
                        </span>

                        <span aria-hidden="true" className="text-neutral-300">·</span>

                        <span className="font-mono-num font-semibold text-neutral-800">
                          {item.trackingCode}
                        </span>

                        <span aria-hidden="true" className="text-neutral-300">·</span>

                        <span className="font-medium text-neutral-700">
                          {getCategoryName(item.category)}
                        </span>

                        <span aria-hidden="true" className="text-neutral-300">·</span>

                        <span className="flex items-center gap-1 text-neutral-600">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                          {getWardName(item.ward)}
                        </span>

                        <span aria-hidden="true" className="text-neutral-300">·</span>

                        <span className="flex items-center gap-1 text-neutral-500">
                          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                          {formattedDate}
                        </span>
                      </div>

                      {/* Title in warm editorial serif */}
                      <h3 className="text-base sm:text-lg font-bold text-neutral-900 leading-[1.4] font-serif-bangla">
                        {item.title}
                      </h3>

                      {/* Description with comfortable reading leading */}
                      <p className="text-xs sm:text-sm text-neutral-600 mt-2 line-clamp-2 leading-[1.65]">
                        {item.description}
                      </p>

                      {/* Specific location marker */}
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-3">
                        <span className="font-medium text-neutral-700">
                          {isAdvice
                            ? language === 'bn'
                              ? 'প্রসঙ্গের এলাকা:'
                              : 'Scope / Location:'
                            : language === 'bn'
                            ? 'স্থান:'
                            : 'Location:'}
                        </span>
                        <span>{item.specificLocation}</span>
                      </div>

                      {/* Resolution note preview if resolved */}
                      {item.resolutionNote && (
                        <div
                          className={`mt-3 border p-3 rounded-xl text-xs flex items-start gap-2 ${
                            isAdvice
                              ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950'
                              : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                          }`}
                        >
                          <CheckCircle2
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              isAdvice ? 'text-indigo-700' : 'text-emerald-700'
                            }`}
                          />
                          <div>
                            <span className="font-semibold block">
                              {language === 'bn'
                                ? isAdvice
                                  ? 'পরামর্শ বাস্তবায়ন বা পদক্ষেপ:'
                                  : 'পদক্ষেপ ও সমাধান বিবরণ:'
                                : 'Official Action Summary:'}
                            </span>
                            <span>{item.resolutionNote}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Status badge & Actions */}
                    <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-neutral-100">
                      
                      {/* Status indicator */}
                      <div className="flex items-center gap-1.5">
                        {item.status === 'resolved' ? (
                          <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            {getStatusLabel(item.status, isAdvice)}
                          </span>
                        ) : item.status === 'in_progress' ? (
                          <span className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                            <Clock className="w-4 h-4 text-amber-600" />
                            {getStatusLabel(item.status, isAdvice)}
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-neutral-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4 text-neutral-400" />
                            {getStatusLabel(item.status, isAdvice)}
                          </span>
                        )}

                        {item.urgency === 'critical' && (
                          <span className="text-xs font-bold text-red-700 ml-1">
                            ({getUrgencyText(item.urgency, isAdvice)})
                          </span>
                        )}
                      </div>

                      {/* Action buttons: Upvote & View Details */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onUpvote(item.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                            item.userUpvoted
                              ? isAdvice
                                ? 'bg-indigo-50 border-indigo-600 text-indigo-900 font-semibold'
                                : 'bg-emerald-50 border-emerald-600 text-emerald-800 font-semibold'
                              : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                          }`}
                          title={language === 'bn' ? 'সমর্থন জানান' : 'Support this'}
                        >
                          <ThumbsUp
                            className={`w-3.5 h-3.5 ${
                              item.userUpvoted
                                ? isAdvice
                                  ? 'fill-indigo-700 text-indigo-700'
                                  : 'fill-emerald-700 text-emerald-700'
                                : ''
                            }`}
                          />
                          <span className="font-mono-num">{item.upvotes}</span>
                          <span className="hidden sm:inline">
                            {language === 'bn' ? 'সমর্থন' : 'Support'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onViewDetails(item)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{strings.viewDetails}</span>
                        </button>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};

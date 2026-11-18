import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Language, ProblemReport, AreaStat, CategoryStat, ProblemStatus, LeaderProfile, ManifestoItem } from './types';
import { INITIAL_AREAS, CATEGORIES, INITIAL_PROBLEMS, DEFAULT_PROFILE, LEADER_PERMANENT_PHOTO_URL } from './data/mockData';
import { INITIAL_MANIFESTO_ITEMS } from './data/manifestoData';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ManifestoSection } from './components/ManifestoSection';
import { StatisticsSection } from './components/StatisticsSection';
import { ProblemFeedSection } from './components/ProblemFeedSection';
import { SubmitProblemModal } from './components/SubmitProblemModal';
import { TrackProblemModal } from './components/TrackProblemModal';
import { ProblemDetailModal } from './components/ProblemDetailModal';
import { MobileActionBar } from './components/MobileActionBar';

// অ্যাডমিন প্যানেল ভারী (১২০ KB+); সাধারণ ভিজিটরের ফোনে লোড না করে শুধু খুললে আনা হয়
const AdminSectionModal = lazy(() =>
  import('./components/AdminSectionModal').then((m) => ({ default: m.AdminSectionModal }))
);
import { Footer } from './components/Footer';
import { api, ApiError } from './services/api';

const STORAGE_KEY_PROBLEMS = 'dhamti_real_problems_v1';
const STORAGE_KEY_PROFILE = 'dhamti_leader_profile_v1';
const STORAGE_KEY_VILLAGES = 'dhamti_ward_villages_v1';
const STORAGE_KEY_MANIFESTO = 'dhamti_electoral_manifesto_v2';

export default function App() {
  const [language, setLanguage] = useState<Language>('bn');

  // Load real problems & advice from local storage (Initial render fallback)
  const [problems, setProblems] = useState<ProblemReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROBLEMS);
      if (saved) {
        // আগের সংস্করণের ক্যাশে নাম/ফোন থাকতে পারে; সেগুলো মুছে নিই
        const cached: ProblemReport[] = JSON.parse(saved);
        return cached.map((p) => ({ ...p, phone: '', citizenName: 'এলাকাবাসী' }));
      }
    } catch {
      // ignore
    }
    return INITIAL_PROBLEMS;
  });

  // Persistent Leader Profile with Hardcoded Permanent Portrait
  const [leaderProfile, setLeaderProfile] = useState<LeaderProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_PROFILE, ...parsed };
      }
    } catch {
      // ignore
    }
    return DEFAULT_PROFILE;
  });

  // ওয়ার্ডের গ্রামের নাম (অ্যাডমিন বদলাতে পারেন): { 'ward-01': 'গ্রাম১, গ্রাম২' }
  const [wardVillages, setWardVillages] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VILLAGES);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {};
  });

  // Persistent Electoral Manifesto (updated directly by admin)
  const [manifestoItems, setManifestoItems] = useState<ManifestoItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MANIFESTO);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return INITIAL_MANIFESTO_ITEMS;
  });

  const [selectedWard, setSelectedWard] = useState<string>('');

  // ছোট বার্তা-বার (সার্ভারে কাজ ব্যর্থ হলে অ্যাডমিন/নাগরিক জানতে পারবেন)
  const [notice, setNotice] = useState<string>('');
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 6000);
    return () => clearTimeout(t);
  }, [notice]);
  const failMessage = (err: unknown, fallback: string) =>
    err instanceof ApiError ? err.message : fallback;

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [activeDetailProblem, setActiveDetailProblem] = useState<ProblemReport | null>(null);

  // Initial Fetch from Turso DB
  useEffect(() => {
    let isMounted = true;
    async function fetchFromTurso() {
      try {
        const [dbProblems, dbManifesto, dbProfile, dbSettings] = await Promise.all([
          api.getProblems().catch(() => null),
          api.getManifesto().catch(() => null),
          api.getProfile().catch(() => null),
          api.getSettings().catch(() => null),
        ]);
        if (!isMounted) return;

        if (dbProblems && Array.isArray(dbProblems)) {
          setProblems(dbProblems);
        }
        // ফাঁকা তালিকাও সত্য (ইশতেহার এখনো প্রকাশিত হয়নি), তাই পুরনো ক্যাশ ঝেড়ে ফেলি
        if (dbManifesto && Array.isArray(dbManifesto)) {
          setManifestoItems(dbManifesto);
        }
        if (dbSettings && dbSettings.wardVillages && typeof dbSettings.wardVillages === 'object') {
          setWardVillages(dbSettings.wardVillages);
        }
        if (dbProfile && dbProfile.name) {
          setLeaderProfile((prev) => ({
            ...prev,
            ...dbProfile,
            phone: dbProfile.phone || DEFAULT_PROFILE.phone,
            email: dbProfile.email || DEFAULT_PROFILE.email,
            profileImage: dbProfile.profileImage || '/leader.jpg',
          }));
        }
      } catch (err) {
        console.warn('Initial load from Turso DB notice:', err);
      }
    }
    fetchFromTurso();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync real problems to localStorage as local cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROBLEMS, JSON.stringify(problems));
    } catch {
      // storage unavailable
    }
  }, [problems]);

  // Sync leader profile to localStorage as local cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(leaderProfile));
    } catch {
      // storage unavailable
    }
  }, [leaderProfile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_VILLAGES, JSON.stringify(wardVillages));
    } catch {
      // storage unavailable
    }
  }, [wardVillages]);

  // Sync manifesto to localStorage as local cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MANIFESTO, JSON.stringify(manifestoItems));
    } catch {
      // storage unavailable
    }
  }, [manifestoItems]);

  // Real statistics strictly from actual complaints & advice
  const totalSubmissions = problems.length;
  const totalResolved = problems.filter((p) => p.status === 'resolved').length;
  const totalInProgress = problems.filter((p) => p.status === 'in_progress').length;

  // Real dynamic ward problem counts
  const computedAreas: AreaStat[] = useMemo(() => {
    return INITIAL_AREAS.map((area) => {
      const wardProblems = problems.filter((p) => p.ward === area.wardNumber);
      const resolved = wardProblems.filter((p) => p.status === 'resolved');
      const villages = (wardVillages[area.wardNumber] || '').trim();
      return {
        ...area,
        // গ্রামের নাম থাকলে ওয়ার্ডের পাশে বসে: "ওয়ার্ড নং ০১ (গ্রাম১, গ্রাম২)"
        wardNameBn: villages ? `${area.wardNameBn} (${villages})` : area.wardNameBn,
        wardNameEn: villages ? `${area.wardNameEn} (${villages})` : area.wardNameEn,
        totalProblems: wardProblems.length,
        resolvedProblems: resolved.length,
      };
    });
  }, [problems, wardVillages]);

  // Real dynamic category counts
  const computedCategories: CategoryStat[] = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      ...cat,
      count: problems.filter((p) => p.category === cat.id).length,
    }));
  }, [problems]);

  // নতুন অভিযোগ/পরামর্শ: আগে সার্ভারে সংরক্ষণ, সফল হলে তবেই পর্দায় ও কোড দেখানো।
  // ব্যর্থ হলে ত্রুটি ছুঁড়ে দেওয়া হয়, ফর্ম সেটা দেখাবে।
  const handleAddNewProblem = async (newProblem: ProblemReport): Promise<ProblemReport> => {
    const created = await api.createProblem(newProblem);
    setProblems((prev) => [created, ...prev]);
    return created;
  };

  // Upvote problem / advice in Turso DB
  const handleUpvote = async (problemId: string) => {
    const target = problems.find((p) => p.id === problemId);
    const isUpvoted = target?.userUpvoted;
    const delta = isUpvoted ? -1 : 1;

    setProblems((prev) =>
      prev.map((item) => {
        if (item.id === problemId) {
          return {
            ...item,
            upvotes: isUpvoted ? Math.max(0, item.upvotes - 1) : item.upvotes + 1,
            userUpvoted: !isUpvoted,
          };
        }
        return item;
      })
    );

    if (activeDetailProblem && activeDetailProblem.id === problemId) {
      setActiveDetailProblem((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          upvotes: isUpvoted ? Math.max(0, prev.upvotes - 1) : prev.upvotes + 1,
          userUpvoted: !isUpvoted,
        };
      });
    }

    try {
      await api.upvoteProblem(problemId, delta);
    } catch (err) {
      console.error('Failed to sync upvote to Turso DB:', err);
      // সার্ভারে না গেলে পর্দার সংখ্যা আগের অবস্থায় ফিরিয়ে দিই
      setProblems((prev) =>
        prev.map((item) =>
          item.id === problemId
            ? {
                ...item,
                upvotes: isUpvoted ? item.upvotes + 1 : Math.max(0, item.upvotes - 1),
                userUpvoted: Boolean(isUpvoted),
              }
            : item
        )
      );
      setNotice(failMessage(err, 'সমর্থন নথিভুক্ত করা যায়নি।'));
    }
  };

  // Delete problem / advice from Admin in Turso DB
  const handleDeleteProblem = async (problemId: string) => {
    try {
      await api.deleteProblem(problemId);
      setProblems((prev) => prev.filter((p) => p.id !== problemId));
      if (activeDetailProblem?.id === problemId) {
        setActiveDetailProblem(null);
      }
    } catch (err) {
      console.error('Failed to delete problem in Turso DB:', err);
      setNotice(failMessage(err, 'মোছা যায়নি। আবার লগইন করে চেষ্টা করুন।'));
    }
  };

  // Update status from Admin in Turso DB
  const handleUpdateStatus = async (
    problemId: string,
    newStatus: ProblemStatus,
    noteText: string,
    officerName: string
  ) => {
    try {
      const updated = await api.updateProblemStatus(problemId, newStatus, noteText, officerName);
      setProblems((prev) =>
        prev.map((item) =>
          item.id === problemId ? { ...updated, userUpvoted: item.userUpvoted } : item
        )
      );
    } catch (err) {
      console.error('Failed to update status in Turso DB:', err);
      setNotice(failMessage(err, 'অবস্থা বদলানো যায়নি। আবার লগইন করে চেষ্টা করুন।'));
    }
  };

  // Manifesto Admin handlers with Turso DB sync
  const handleUpdateManifestoItem = async (updated: ManifestoItem) => {
    try {
      const saved = await api.updateManifestoItem(updated);
      setManifestoItems((prev) => prev.map((m) => (m.id === saved.id ? saved : m)));
    } catch (err) {
      console.error('Failed to update manifesto item in Turso DB:', err);
      setNotice(failMessage(err, 'সংরক্ষণ করা যায়নি। আবার লগইন করে চেষ্টা করুন।'));
    }
  };

  const handleAddManifestoItem = async (newItem: ManifestoItem) => {
    try {
      const saved = await api.createManifestoItem(newItem);
      setManifestoItems((prev) => [saved, ...prev]);
    } catch (err) {
      console.error('Failed to create manifesto item in Turso DB:', err);
      setNotice(failMessage(err, 'সংরক্ষণ করা যায়নি। আবার লগইন করে চেষ্টা করুন।'));
    }
  };

  const handleDeleteManifestoItem = async (itemId: string) => {
    try {
      await api.deleteManifestoItem(itemId);
      setManifestoItems((prev) => prev.filter((m) => m.id !== itemId));
    } catch (err) {
      console.error('Failed to delete manifesto item in Turso DB:', err);
      setNotice(failMessage(err, 'মোছা যায়নি। আবার লগইন করে চেষ্টা করুন।'));
    }
  };

  const handleDeleteCompletedManifestos = async () => {
    try {
      await api.deleteCompletedManifestos();
      setManifestoItems((prev) => prev.filter((m) => m.status !== 'completed'));
    } catch (err) {
      console.error('Failed to delete completed manifestos in Turso DB:', err);
      setNotice(failMessage(err, 'মোছা যায়নি। আবার লগইন করে চেষ্টা করুন।'));
    }
  };

  const handleResetManifesto = async () => {
    try {
      const items = await api.resetManifesto();
      setManifestoItems(items);
    } catch (err) {
      console.error('Failed to reset manifesto in Turso DB:', err);
      setNotice(failMessage(err, 'রিসেট করা যায়নি। আবার লগইন করে চেষ্টা করুন।'));
    }
  };

  // অ্যাডমিন ফর্মের জন্য: ব্যর্থ হলে ত্রুটি ছুঁড়ি, ফর্ম নিজেই কারণ দেখায়
  const handleUpdateLeaderProfile = async (updated: LeaderProfile) => {
    const saved = await api.updateProfile(updated);
    setLeaderProfile((prev) => ({ ...prev, ...saved }));
  };

  // ছবি বদলানো (dataUrl) বা মুছে আগের ছবিতে ফেরা (null)
  const handleSetLeaderPhoto = async (dataUrl: string | null) => {
    const saved = dataUrl ? await api.setProfilePhoto(dataUrl) : await api.resetProfilePhoto();
    setLeaderProfile((prev) => ({ ...prev, ...saved }));
  };

  const handleSaveWardVillages = async (villages: Record<string, string>) => {
    const saved = await api.updateSettings({ wardVillages: villages });
    setWardVillages(saved.wardVillages || {});
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 pb-24 md:pb-0">
      {/* Top Bar Header (Clean Citizen View) */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenTrackModal={() => setIsTrackModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section matching sketch with Leader Representation & Slogan Pedestal */}
        <HeroSection
          language={language}
          onOpenReportModal={() => setIsReportModalOpen(true)}
          onOpenTrackModal={() => setIsTrackModalOpen(true)}
          totalProblemsCount={totalSubmissions}
          resolvedProblemsCount={totalResolved}
          leaderProfile={leaderProfile}
        />

        {/* Dedicated Electoral Manifesto Section (Updated live by Admin) */}
        <ManifestoSection
          language={language}
          manifestoItems={manifestoItems}
          onOpenAdmin={() => setIsAdminModalOpen(true)}
          onOpenReportModal={() => setIsReportModalOpen(true)}
        />

        {/* Real Statistics Section */}
        <StatisticsSection
          language={language}
          areas={computedAreas}
          categories={computedCategories}
          selectedWard={selectedWard}
          onSelectWard={setSelectedWard}
          totalSubmissions={totalSubmissions}
          totalResolved={totalResolved}
          totalInProgress={totalInProgress}
        />

        {/* Grievances & Advice Feed with Status Monitor */}
        <ProblemFeedSection
          language={language}
          problems={problems}
          areas={computedAreas}
          categories={computedCategories}
          selectedWard={selectedWard}
          onSelectWard={setSelectedWard}
          onUpvote={handleUpvote}
          onViewDetails={(problem) => setActiveDetailProblem(problem)}
        />
      </main>

      {/* Modals & Overlays */}
      <SubmitProblemModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        language={language}
        areas={computedAreas}
        categories={computedCategories}
        onSubmit={handleAddNewProblem}
      />

      <TrackProblemModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        language={language}
        problems={problems}
      />

      <ProblemDetailModal
        problem={activeDetailProblem}
        isOpen={Boolean(activeDetailProblem)}
        onClose={() => setActiveDetailProblem(null)}
        language={language}
        onUpvote={handleUpvote}
      />

      {/* Complete Dedicated Admin Section Modal */}
      {isAdminModalOpen && (
        <Suspense fallback={null}>
          <AdminSectionModal
            isOpen={isAdminModalOpen}
            onClose={() => setIsAdminModalOpen(false)}
            language={language}
            problems={problems}
            areas={computedAreas}
            categories={computedCategories}
            leaderProfile={leaderProfile}
            manifestoItems={manifestoItems}
            onUpdateLeaderProfile={handleUpdateLeaderProfile}
            onSetLeaderPhoto={handleSetLeaderPhoto}
            wardVillages={wardVillages}
            onSaveWardVillages={handleSaveWardVillages}
            onUpdateProblemStatus={handleUpdateStatus}
            onDeleteProblem={handleDeleteProblem}
            onUpdateManifestoItem={handleUpdateManifestoItem}
            onAddManifestoItem={handleAddManifestoItem}
            onDeleteManifestoItem={handleDeleteManifestoItem}
            onDeleteCompletedManifestos={handleDeleteCompletedManifestos}
            onResetManifesto={handleResetManifesto}
          />
        </Suspense>
      )}

      {notice && (
        <div
          role="alert"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:max-w-md z-[60] bg-red-700 text-white text-base font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-start gap-3"
        >
          <span className="flex-1">{notice}</span>
          <button type="button" onClick={() => setNotice('')} className="shrink-0 px-2 text-xl leading-none" aria-label="বন্ধ করুন">
            ×
          </button>
        </div>
      )}

      <MobileActionBar
        language={language}
        phone={leaderProfile.phone}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenTrackModal={() => setIsTrackModalOpen(true)}
      />

      {/* Quiet Footer with Admin access */}
      <Footer
        language={language}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenTrackModal={() => setIsTrackModalOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        leaderProfile={leaderProfile}
      />
    </div>
  );
}

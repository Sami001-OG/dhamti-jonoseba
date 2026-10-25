import React, { useState, useEffect, useMemo } from 'react';
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
import { AdminSectionModal } from './components/AdminSectionModal';
import { Footer } from './components/Footer';

const STORAGE_KEY_PROBLEMS = 'dhamti_real_problems_v1';
const STORAGE_KEY_PROFILE = 'dhamti_leader_profile_v1';
const STORAGE_KEY_MANIFESTO = 'dhamti_electoral_manifesto_v1';

export default function App() {
  const [language, setLanguage] = useState<Language>('bn');

  // Load real problems & advice from local storage (Zero Mock Data!)
  const [problems, setProblems] = useState<ProblemReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROBLEMS);
      if (saved) {
        return JSON.parse(saved);
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
        return {
          ...parsed,
          phone: DEFAULT_PROFILE.phone, // Enforce official 01613394074
          email: DEFAULT_PROFILE.email, // Enforce official Anwarbhuiyan184@gmail.com
          profileImage: '/leader.jpg',
        };
      }
    } catch {
      // ignore
    }
    return {
      ...DEFAULT_PROFILE,
      profileImage: '/leader.jpg',
    };
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

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [activeDetailProblem, setActiveDetailProblem] = useState<ProblemReport | null>(null);

  // Sync real problems to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROBLEMS, JSON.stringify(problems));
    } catch {
      // storage unavailable
    }
  }, [problems]);

  // Sync leader profile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(leaderProfile));
    } catch {
      // storage unavailable
    }
  }, [leaderProfile]);

  // Sync manifesto to localStorage
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
      return {
        ...area,
        totalProblems: wardProblems.length,
        resolvedProblems: resolved.length,
      };
    });
  }, [problems]);

  // Real dynamic category counts
  const computedCategories: CategoryStat[] = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      ...cat,
      count: problems.filter((p) => p.category === cat.id).length,
    }));
  }, [problems]);

  // Add new complaint or advice
  const handleAddNewProblem = (newProblem: ProblemReport) => {
    setProblems((prev) => [newProblem, ...prev]);
  };

  // Upvote problem / advice
  const handleUpvote = (problemId: string) => {
    setProblems((prev) =>
      prev.map((item) => {
        if (item.id === problemId) {
          const isUpvoted = item.userUpvoted;
          return {
            ...item,
            upvotes: isUpvoted ? item.upvotes - 1 : item.upvotes + 1,
            userUpvoted: !isUpvoted,
          };
        }
        return item;
      })
    );

    if (activeDetailProblem && activeDetailProblem.id === problemId) {
      setActiveDetailProblem((prev) => {
        if (!prev) return null;
        const isUpvoted = prev.userUpvoted;
        return {
          ...prev,
          upvotes: isUpvoted ? prev.upvotes - 1 : prev.upvotes + 1,
          userUpvoted: !isUpvoted,
        };
      });
    }
  };

  // Delete problem / advice from Admin
  const handleDeleteProblem = (problemId: string) => {
    setProblems((prev) => prev.filter((p) => p.id !== problemId));
    if (activeDetailProblem?.id === problemId) {
      setActiveDetailProblem(null);
    }
  };

  // Update status from Admin
  const handleUpdateStatus = (
    problemId: string,
    newStatus: ProblemStatus,
    noteText: string,
    officerName: string
  ) => {
    const nowIso = new Date().toISOString();

    setProblems((prev) =>
      prev.map((item) => {
        if (item.id === problemId) {
          const newTimelineEvent = {
            id: `t-${Date.now()}`,
            timestamp: nowIso,
            status: newStatus,
            noteBn: noteText,
            noteEn: noteText,
            author: officerName || leaderProfile.name,
          };

          return {
            ...item,
            status: newStatus,
            assignedOfficer: officerName || item.assignedOfficer,
            resolutionNote: newStatus === 'resolved' ? noteText : item.resolutionNote,
            timeline: [newTimelineEvent, ...item.timeline],
          };
        }
        return item;
      })
    );
  };

  // Manifesto Admin handlers
  const handleUpdateManifestoItem = (updated: ManifestoItem) => {
    setManifestoItems((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  const handleAddManifestoItem = (newItem: ManifestoItem) => {
    setManifestoItems((prev) => [newItem, ...prev]);
  };

  const handleDeleteManifestoItem = (itemId: string) => {
    setManifestoItems((prev) => prev.filter((m) => m.id !== itemId));
  };

  const handleResetManifesto = () => {
    setManifestoItems(INITIAL_MANIFESTO_ITEMS);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
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
      <AdminSectionModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        language={language}
        problems={problems}
        areas={computedAreas}
        categories={computedCategories}
        leaderProfile={leaderProfile}
        manifestoItems={manifestoItems}
        onUpdateLeaderProfile={setLeaderProfile}
        onUpdateProblemStatus={handleUpdateStatus}
        onDeleteProblem={handleDeleteProblem}
        onUpdateManifestoItem={handleUpdateManifestoItem}
        onAddManifestoItem={handleAddManifestoItem}
        onDeleteManifestoItem={handleDeleteManifestoItem}
        onResetManifesto={handleResetManifesto}
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

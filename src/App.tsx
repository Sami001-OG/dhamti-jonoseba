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
import { api } from './services/api';

const STORAGE_KEY_PROBLEMS = 'dhamti_real_problems_v1';
const STORAGE_KEY_PROFILE = 'dhamti_leader_profile_v1';
const STORAGE_KEY_MANIFESTO = 'dhamti_electoral_manifesto_v1';

export default function App() {
  const [language, setLanguage] = useState<Language>('bn');

  // Load real problems & advice from local storage (Initial render fallback)
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

  // Initial Fetch from Turso DB
  useEffect(() => {
    let isMounted = true;
    async function fetchFromTurso() {
      try {
        const [dbProblems, dbManifesto, dbProfile] = await Promise.all([
          api.getProblems().catch(() => null),
          api.getManifesto().catch(() => null),
          api.getProfile().catch(() => null),
        ]);
        if (!isMounted) return;

        if (dbProblems && Array.isArray(dbProblems)) {
          setProblems(dbProblems);
        }
        if (dbManifesto && Array.isArray(dbManifesto) && dbManifesto.length > 0) {
          setManifestoItems(dbManifesto);
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

  // Add new complaint or advice to Turso DB
  const handleAddNewProblem = async (newProblem: ProblemReport) => {
    setProblems((prev) => [newProblem, ...prev]);
    try {
      await api.createProblem(newProblem);
    } catch (err) {
      console.error('Failed to sync new problem to Turso DB:', err);
    }
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
    }
  };

  // Delete problem / advice from Admin in Turso DB
  const handleDeleteProblem = async (problemId: string) => {
    setProblems((prev) => prev.filter((p) => p.id !== problemId));
    if (activeDetailProblem?.id === problemId) {
      setActiveDetailProblem(null);
    }
    try {
      await api.deleteProblem(problemId);
    } catch (err) {
      console.error('Failed to delete problem in Turso DB:', err);
    }
  };

  // Update status from Admin in Turso DB
  const handleUpdateStatus = async (
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

    try {
      await api.updateProblemStatus(problemId, newStatus, noteText, officerName);
    } catch (err) {
      console.error('Failed to update status in Turso DB:', err);
    }
  };

  // Manifesto Admin handlers with Turso DB sync
  const handleUpdateManifestoItem = async (updated: ManifestoItem) => {
    setManifestoItems((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    try {
      await api.updateManifestoItem(updated);
    } catch (err) {
      console.error('Failed to update manifesto item in Turso DB:', err);
    }
  };

  const handleAddManifestoItem = async (newItem: ManifestoItem) => {
    setManifestoItems((prev) => [newItem, ...prev]);
    try {
      await api.createManifestoItem(newItem);
    } catch (err) {
      console.error('Failed to create manifesto item in Turso DB:', err);
    }
  };

  const handleDeleteManifestoItem = async (itemId: string) => {
    setManifestoItems((prev) => prev.filter((m) => m.id !== itemId));
    try {
      await api.deleteManifestoItem(itemId);
    } catch (err) {
      console.error('Failed to delete manifesto item in Turso DB:', err);
    }
  };

  const handleDeleteCompletedManifestos = async () => {
    setManifestoItems((prev) => prev.filter((m) => m.status !== 'completed'));
    try {
      await api.deleteCompletedManifestos();
    } catch (err) {
      console.error('Failed to delete completed manifestos in Turso DB:', err);
    }
  };

  const handleResetManifesto = async () => {
    setManifestoItems(INITIAL_MANIFESTO_ITEMS);
    try {
      await api.resetManifesto();
    } catch (err) {
      console.error('Failed to reset manifesto in Turso DB:', err);
    }
  };

  const handleUpdateLeaderProfile = async (updated: LeaderProfile) => {
    setLeaderProfile(updated);
    try {
      await api.updateProfile(updated);
    } catch (err) {
      console.error('Failed to update profile in Turso DB:', err);
    }
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
          onOpenAdmin={() => setIsAdminModalOpen(true)}
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
        onUpdateLeaderProfile={handleUpdateLeaderProfile}
        onUpdateProblemStatus={handleUpdateStatus}
        onDeleteProblem={handleDeleteProblem}
        onUpdateManifestoItem={handleUpdateManifestoItem}
        onAddManifestoItem={handleAddManifestoItem}
        onDeleteManifestoItem={handleDeleteManifestoItem}
        onDeleteCompletedManifestos={handleDeleteCompletedManifestos}
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

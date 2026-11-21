import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  createAnnouncement,
  deleteAnnouncement,
  subscribeAllAnnouncements,
  subscribePublishedAnnouncements,
  toggleAnnouncementStatus,
  updateAnnouncement,
} from './lib/announcements';
import { checkIsAdmin, signOutAccount, subscribeAuthState } from './lib/auth';
import type {
  Announcement,
  AnnouncementFormInput,
  DashboardStats,
  ToastNotification,
} from './types/announcement';
import { AdminDashboardPage } from './components/AdminDashboardPage';
import { AnnouncementEditorPage } from './components/AnnouncementEditorPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import {
  AnnouncementDetailModal,
  DeleteConfirmDialog,
  ToastStack,
} from './components/Overlays';
import { PortalEntryPage, type PortalRole } from './components/PortalEntryPage';
import { PublicNoticesPage } from './components/PublicNoticesPage';
import { Navbar, type PageTab } from './components/Navbar';
import { HomeSection } from './components/HomeSection';
import { InsightsSection } from './components/InsightsSection';
import { MoodJournalSection } from './components/MoodJournalSection';
import { Footer } from './components/Footer';

type AdminView = 'dashboard' | 'editor';

// Use localStorage so the role survives page refreshes and tab closes
const PORTAL_ROLE_STORAGE_KEY = 'mimo_portal_role';

interface SectionConfig {
  videoUrl: string;
  overlayClass: string;
  fallbackGradient: string;
}

const SECTION_CONFIGS: Record<PageTab, SectionConfig> = {
  home: {
    videoUrl:
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260705_143518_88285de9-3f05-4256-9e49-025f75cb6bcb.mp4',
    overlayClass: 'bg-[#4C5930]/40',
    fallbackGradient: 'from-[#4C5930] via-[#3a4425] to-[#202616]',
  },
  insights: {
    videoUrl:
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260705_141850_7f43c95b-a2cd-4586-ae77-86a10221b9e1.mp4',
    overlayClass: 'bg-[#4A3968]/40',
    fallbackGradient: 'from-[#4A3968] via-[#36294c] to-[#1f172c]',
  },
  journal: {
    videoUrl:
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260705_142807_689d92ab-24f9-419b-a340-76863735ff03.mp4',
    overlayClass: 'bg-[#7F7160]/40',
    fallbackGradient: 'from-[#7F7160] via-[#5b5145] to-[#302a24]',
  },
  announcements: {
    videoUrl:
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260705_143518_88285de9-3f05-4256-9e49-025f75cb6bcb.mp4',
    overlayClass: 'bg-[#4C5930]/40',
    fallbackGradient: 'from-[#556436] via-[#4C5930] to-[#2e381c]',
  },
};

function readStoredRole(): PortalRole | null {
  try {
    const value = window.localStorage.getItem(PORTAL_ROLE_STORAGE_KEY);
    return value === 'user' || value === 'admin' ? value : null;
  } catch {
    return null;
  }
}

function writeStoredRole(role: PortalRole | null): void {
  try {
    if (role) {
      window.localStorage.setItem(PORTAL_ROLE_STORAGE_KEY, role);
    } else {
      window.localStorage.removeItem(PORTAL_ROLE_STORAGE_KEY);
    }
  } catch {
    // Ignore storage access errors in restricted environments
  }
}

function extractFriendlyError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  try {
    const parsed = JSON.parse(raw) as { error?: string };
    if (parsed && typeof parsed.error === 'string') {
      return parsed.error;
    }
  } catch {
    // Plain message
  }
  return raw;
}

/** Full-screen loading state shown while Firebase restores the auth session */
function AppLoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#556436] via-[#4C5930] to-[#2e381c] z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        <p className="text-white/80 text-sm font-medium tracking-wide">
          Restoring your session...
        </p>
      </div>
    </div>
  );
}

function MimoAnnouncementApp() {
  // Active Website Tab (Soul Canvas navigation)
  const [activeTab, setActiveTab] = useState<PageTab>('home');
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [portalRole, setPortalRoleState] = useState<PortalRole | null>(() => readStoredRole());
  const [adminView, setAdminView] = useState<AdminView>('dashboard');

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const authInitialisedRef = useRef(false);

  const [publishedAnnouncements, setPublishedAnnouncements] = useState<Announcement[]>([]);
  const [loadingPublic, setLoadingPublic] = useState(true);
  const [publicError, setPublicError] = useState<string | null>(null);

  const [adminAnnouncements, setAdminAnnouncements] = useState<Announcement[]>([]);
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [viewingAnnouncement, setViewingAnnouncement] = useState<Announcement | null>(null);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState<Announcement | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const currentConfig = SECTION_CONFIGS[activeTab];

  // Refresh video playback when active tab changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [activeTab]);

  const setPortalRole = useCallback((role: PortalRole | null) => {
    setPortalRoleState(role);
    writeStoredRole(role);
    if (role !== 'admin') {
      setAdminView('dashboard');
      setEditingAnnouncement(null);
    }
  }, []);

  const notify = useCallback(
    (variant: 'success' | 'error' | 'info', title: string, message?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, variant, title, message }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
      }, 4500);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // ─── Firebase Auth State Listener ───────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = subscribeAuthState((nextUser) => {
      setUser(nextUser);
      authInitialisedRef.current = true;

      if (!nextUser) {
        setIsAdmin(false);
        setAuthLoading(false);
        setPortalRole(null);
        setPublishedAnnouncements([]);
        setAdminAnnouncements([]);
        setEditingAnnouncement(null);
        return;
      }

      setAuthLoading(true);
      void checkIsAdmin(nextUser)
        .then((allowed) => {
          setIsAdmin(allowed);
        })
        .finally(() => {
          setAuthLoading(false);
        });
    });

    return () => unsubscribe();
  }, [setPortalRole]);

  const handleUserVerifiedRefresh = useCallback((refreshedUser: User | null) => {
    setUser(refreshedUser ? ({ ...refreshedUser } as User) : null);
    if (!refreshedUser) {
      setIsAdmin(false);
      return;
    }
    setAuthLoading(true);
    void checkIsAdmin(refreshedUser)
      .then((allowed) => {
        setIsAdmin(allowed);
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, []);

  // ─── Real-time user feed ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!user || portalRole !== 'user') {
      setLoadingPublic(false);
      setPublicError(null);
      return;
    }

    setLoadingPublic(true);
    setPublicError(null);
    const unsubscribe = subscribePublishedAnnouncements(
      (items) => {
        setPublishedAnnouncements(items);
        setLoadingPublic(false);
        setPublicError(null);
      },
      (err) => {
        setLoadingPublic(false);
        setPublicError(extractFriendlyError(err));
      }
    );

    return () => unsubscribe();
  }, [user, portalRole]);

  // ─── Real-time admin feed ────────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !isAdmin || portalRole !== 'admin') {
      setAdminAnnouncements([]);
      setLoadingAdmin(false);
      setAdminError(null);
      return;
    }

    setLoadingAdmin(true);
    setAdminError(null);
    const unsubscribe = subscribeAllAnnouncements(
      (items) => {
        setAdminAnnouncements(items);
        setLoadingAdmin(false);
        setAdminError(null);
      },
      (err) => {
        setLoadingAdmin(false);
        setAdminError(extractFriendlyError(err));
      }
    );

    return () => unsubscribe();
  }, [user, isAdmin, portalRole]);

  const stats: DashboardStats = useMemo(() => {
    return adminAnnouncements.reduce<DashboardStats>(
      (acc, item) => {
        acc.total += 1;
        if (item.status === 'Published') acc.published += 1;
        if (item.type === 'General') acc.general += 1;
        if (item.type === 'Important') acc.important += 1;
        if (item.type === 'Maintenance') acc.maintenance += 1;
        return acc;
      },
      { total: 0, published: 0, general: 0, important: 0, maintenance: 0 }
    );
  }, [adminAnnouncements]);

  // ─── Announcement Actions ────────────────────────────────────────────────────
  const handleSaveAnnouncement = async (
    input: AnnouncementFormInput,
    editingId?: string
  ) => {
    if (!user || !isAdmin) {
      notify('error', 'Authentication required', 'Sign in as an administrator to save announcements.');
      setAdminView('dashboard');
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        await updateAnnouncement(editingId, input);
        setEditingAnnouncement(null);
        setAdminView('dashboard');
        notify('success', 'Announcement updated', `"${input.title.trim()}" has been saved.`);
      } else {
        await createAnnouncement(input, user);
        setAdminView('dashboard');
        notify(
          'success',
          input.status === 'Published' ? 'Announcement published' : 'Draft saved',
          `"${input.title.trim()}" stored in Firestore.`
        );
      }
    } catch (err) {
      notify('error', 'Failed to save announcement', extractFriendlyError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (item: Announcement) => {
    const nextStatus = item.status === 'Published' ? 'Draft' : 'Published';
    try {
      await toggleAnnouncementStatus(item.id, nextStatus);
      notify(
        'success',
        nextStatus === 'Published' ? 'Announcement published' : 'Moved to drafts',
        `"${item.title}" is now ${nextStatus}.`
      );
    } catch (err) {
      notify('error', 'Status update failed', extractFriendlyError(err));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingAnnouncement) return;
    setIsDeleting(true);
    const targetTitle = deletingAnnouncement.title;
    const targetId = deletingAnnouncement.id;

    try {
      await deleteAnnouncement(targetId);
      if (editingAnnouncement?.id === targetId) {
        setEditingAnnouncement(null);
      }
      if (viewingAnnouncement?.id === targetId) {
        setViewingAnnouncement(null);
      }
      setDeletingAnnouncement(null);
      notify('success', 'Announcement deleted', `"${targetTitle}" was permanently removed.`);
    } catch (err) {
      notify('error', 'Delete failed', extractFriendlyError(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const openCreatePage = () => {
    setEditingAnnouncement(null);
    setAdminView('editor');
  };

  const openEditPage = (item: Announcement) => {
    setEditingAnnouncement(item);
    setAdminView('editor');
  };

  const isUserSessionActive = Boolean(user && portalRole === 'user');
  const isAdminSessionActive = Boolean(
    user && portalRole === 'admin' && !authLoading && isAdmin
  );

  const renderAnnouncementPortal = () => {
    if (authLoading) {
      return (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full border-2 border-white/30 border-t-white animate-spin mb-4" />
          <p className="text-white/80 text-sm">Synchronizing portal session...</p>
        </div>
      );
    }

    if (isUserSessionActive) {
      return (
        <PublicNoticesPage
          announcements={publishedAnnouncements}
          loading={loadingPublic}
          error={publicError}
          onSelectAnnouncement={(item) => setViewingAnnouncement(item)}
        />
      );
    }

    if (isAdminSessionActive && user) {
      if (adminView === 'editor') {
        return (
          <AnnouncementEditorPage
            editingAnnouncement={editingAnnouncement}
            isSaving={isSaving}
            onSave={handleSaveAnnouncement}
            onCancel={() => {
              setEditingAnnouncement(null);
              setAdminView('dashboard');
            }}
          />
        );
      }

      return (
        <AdminDashboardPage
          user={user}
          announcements={adminAnnouncements}
          loading={loadingAdmin}
          error={adminError}
          stats={stats}
          onViewAnnouncement={(item) => setViewingAnnouncement(item)}
          onEditAnnouncement={openEditPage}
          onDeleteRequest={(item) => setDeletingAnnouncement(item)}
          onToggleStatus={handleToggleStatus}
          onCreateNew={openCreatePage}
          onSignOut={() => setPortalRole(null)}
          onNotify={notify}
        />
      );
    }

    return (
      <PortalEntryPage
        selectedRole={portalRole}
        onSelectRole={setPortalRole}
        user={user}
        authLoading={authLoading}
        isAdmin={isAdmin}
        onUserVerifiedRefresh={handleUserVerifiedRefresh}
        onNotify={notify}
      />
    );
  };

  return (
    <div className="relative min-h-screen min-h-[100svh] flex flex-col justify-between text-white overflow-x-hidden">
      {/* Background Video Layer */}
      <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
        <div className={`absolute inset-0 bg-gradient-to-br ${currentConfig.fallbackGradient} transition-colors duration-1000`} />
        <video
          ref={videoRef}
          key={currentConfig.videoUrl}
          autoPlay
          muted={isMuted}
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
        >
          <source src={currentConfig.videoUrl} type="video/mp4" />
        </video>
        <div className={`absolute inset-0 ${currentConfig.overlayClass} transition-colors duration-1000 backdrop-brightness-[0.92]`} />
        <div className="absolute inset-0 bg-radial from-transparent via-black/10 to-black/45 pointer-events-none" />
      </div>

      {/* Soul Canvas Frosted Glass Header */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        userEmail={user?.email}
        isAdmin={isAdmin}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col items-center">
        {activeTab === 'home' && (
          <HomeSection
            onNavigateToInsights={() => setActiveTab('insights')}
            onNavigateToJournal={() => setActiveTab('journal')}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsSection
            onNavigateToJournal={() => setActiveTab('journal')}
          />
        )}

        {activeTab === 'journal' && (
          <MoodJournalSection />
        )}

        {activeTab === 'announcements' && (
          <div className="w-full">
            {renderAnnouncementPortal()}
          </div>
        )}
      </main>

      {/* Editorial Footer */}
      <Footer activeTab={activeTab} onSelectTab={setActiveTab} />

      <DeleteConfirmDialog
        announcement={deletingAnnouncement}
        isDeleting={isDeleting}
        onCancel={() => setDeletingAnnouncement(null)}
        onConfirm={handleConfirmDelete}
      />

      <AnnouncementDetailModal
        announcement={viewingAnnouncement}
        onClose={() => setViewingAnnouncement(null)}
      />

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MimoAnnouncementApp />
    </ErrorBoundary>
  );
}

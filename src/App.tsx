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
import { AvatarBadge } from './components/AvatarBadge';
import { ErrorBoundary } from './components/ErrorBoundary';
import {
  AnnouncementDetailModal,
  DeleteConfirmDialog,
  ToastStack,
} from './components/Overlays';
import { PortalEntryPage, type PortalRole } from './components/PortalEntryPage';
import { PublicNoticesPage } from './components/PublicNoticesPage';

type AdminView = 'dashboard' | 'editor';

// Use localStorage so the role survives page refreshes and tab closes
const PORTAL_ROLE_STORAGE_KEY = 'mimo_portal_role';

const PRESET_THEME = {
  videoUrl:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260705_143518_88285de9-3f05-4256-9e49-025f75cb6bcb.mp4',
  overlayClass: 'bg-[#4C5930]/40',
  fallbackGradient: 'bg-gradient-to-br from-[#556436] via-[#4C5930] to-[#2e381c]',
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
  const [portalRole, setPortalRoleState] = useState<PortalRole | null>(() => readStoredRole());
  const [adminView, setAdminView] = useState<AdminView>('dashboard');

  const [user, setUser] = useState<User | null>(null);
  // Start as true — Firebase has not yet confirmed session state
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Track if the first auth state event has been received so we can suppress
  // any premature redirect to the login screen before Firebase initialises.
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
  // onAuthStateChanged fires once synchronously when the app loads.
  // Until that first event arrives we keep authLoading = true so we never
  // show the login page prematurely (which would look like a logout on refresh).
  useEffect(() => {
    const unsubscribe = subscribeAuthState((nextUser) => {
      setUser(nextUser);
      authInitialisedRef.current = true;

      if (!nextUser) {
        setIsAdmin(false);
        setAuthLoading(false);
        // Only clear the stored role when the user is definitely signed out —
        // not during the initial loading tick.
        setPortalRole(null);
        setPublishedAnnouncements([]);
        setAdminAnnouncements([]);
        setEditingAnnouncement(null);
        return;
      }

      // User exists: resolve admin status then drop the loading flag
      setAuthLoading(true);
      void checkIsAdmin(nextUser)
        .then((allowed) => {
          setIsAdmin(allowed);
          // If Firebase restored a user and they had the admin role stored,
          // keep them in the admin portal automatically.
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

  // ─── Dashboard Stats ─────────────────────────────────────────────────────────
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

  const handleSignOut = async () => {
    try {
      await signOutAccount();
      setPortalRole(null);
      notify('info', 'Signed out', 'Returned to portal selection.');
    } catch (err) {
      notify('error', 'Sign out failed', extractFriendlyError(err));
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

  // ─── Session Flags ───────────────────────────────────────────────────────────
  // Suppress any content render during the first Firebase auth tick to avoid
  // a flash of the login screen before the restored session is confirmed.
  const isUserSessionActive = Boolean(user && portalRole === 'user');
  const isAdminSessionActive = Boolean(
    user && portalRole === 'admin' && !authLoading && isAdmin
  );

  // ─── Content Renderer ────────────────────────────────────────────────────────
  const renderMainContent = () => {
    // Block rendering until Firebase has resolved the initial auth state.
    // This prevents the login page from briefly flashing on a valid refresh.
    if (authLoading) {
      return null; // The AppLoadingScreen overlay handles the UI
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
    <div className="relative min-h-screen flex flex-col text-white overflow-x-hidden">
      {/* Full-screen loading overlay — shown while Firebase restores auth state */}
      {authLoading && <AppLoadingScreen />}

      {/* Full-Viewport Looping Ambient Video Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
        <div className={`absolute inset-0 ${PRESET_THEME.fallbackGradient}`} />
        <video
          src={PRESET_THEME.videoUrl}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className={`absolute inset-0 ${PRESET_THEME.overlayClass}`} />
      </div>

      {/* Frosted Glass Sticky Header */}
      <header className="sticky top-0 z-40 bg-black/15 backdrop-blur-xl border-b border-white/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* Brand */}
          <button
            type="button"
            onClick={() => {
              if (isAdminSessionActive) {
                setAdminView('dashboard');
              }
            }}
            className="text-base sm:text-lg font-semibold tracking-tight text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            MIMO Announcements
          </button>

          {/* Nav Links — hidden on mobile, shown md+ */}
          {isUserSessionActive ? (
            <nav
              className="hidden md:flex items-center gap-7 text-sm font-medium"
              aria-label="User navigation"
            >
              <span className="py-1 whitespace-nowrap shrink-0 border-b-2 border-white text-white">
                Announcements
              </span>
            </nav>
          ) : isAdminSessionActive ? (
            <nav
              className="hidden md:flex items-center gap-7 text-sm font-medium"
              aria-label="Admin navigation"
            >
              <button
                type="button"
                onClick={() => setAdminView('dashboard')}
                className={`py-1 whitespace-nowrap shrink-0 cursor-pointer border-b-2 transition-colors ${
                  adminView === 'dashboard'
                    ? 'border-white text-white'
                    : 'border-transparent text-white/75 hover:text-white'
                }`}
              >
                Admin Dashboard
              </button>
              <button
                type="button"
                onClick={openCreatePage}
                className={`py-1 whitespace-nowrap shrink-0 cursor-pointer border-b-2 transition-colors ${
                  adminView === 'editor'
                    ? 'border-white text-white'
                    : 'border-transparent text-white/75 hover:text-white'
                }`}
              >
                {editingAnnouncement ? 'Edit Notice' : 'Create Notice'}
              </button>
            </nav>
          ) : (
            <div className="hidden md:block" />
          )}

          {/* Right Zone */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2.5">
              {user && (isUserSessionActive || isAdminSessionActive) && (
                <span className="text-xs text-white/80 max-w-[140px] sm:max-w-[180px] truncate">
                  {user.displayName || user.email}
                </span>
              )}
              <AvatarBadge alt="MIMO Profile" />
            </div>

            {isAdminSessionActive ? (
              <button
                type="button"
                onClick={openCreatePage}
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white text-neutral-800 text-xs sm:text-sm font-medium shadow-md hover:bg-neutral-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span className="hidden sm:inline">New announcement</span>
                <span className="sm:hidden">+ New</span>
              </button>
            ) : isUserSessionActive ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white text-neutral-800 text-xs sm:text-sm font-medium shadow-md hover:bg-neutral-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Sign out
              </button>
            ) : portalRole ? (
              <button
                type="button"
                onClick={() => setPortalRole(null)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/20 border border-white/25 text-white text-xs sm:text-sm font-medium hover:bg-white/30 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Switch role
              </button>
            ) : null}
          </div>
        </div>

        {/* Mobile Admin Navigation Strip */}
        {isAdminSessionActive && (
          <nav
            className="md:hidden border-t border-white/15 px-4 py-2 flex items-center gap-5 overflow-x-auto no-scrollbar text-xs font-medium"
            aria-label="Mobile admin navigation"
          >
            <button
              type="button"
              onClick={() => setAdminView('dashboard')}
              className={`whitespace-nowrap shrink-0 cursor-pointer ${
                adminView === 'dashboard' ? 'text-white font-semibold' : 'text-white/70'
              }`}
            >
              Admin Dashboard
            </button>
            <button
              type="button"
              onClick={openCreatePage}
              className={`whitespace-nowrap shrink-0 cursor-pointer ${
                adminView === 'editor' ? 'text-white font-semibold' : 'text-white/70'
              }`}
            >
              {editingAnnouncement ? 'Edit Notice' : 'Create Notice'}
            </button>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{renderMainContent()}</main>

      {/* Footer */}
      <footer className="border-t border-white/15 bg-black/15 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/75">
          <p>MIMO Announcement Management System</p>
          {isAdminSessionActive ? (
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => setAdminView('dashboard')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Admin Dashboard
              </button>
              <button
                type="button"
                onClick={openCreatePage}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Create Notice
              </button>
            </div>
          ) : (
            <p className="text-white/60">Live official notices</p>
          )}
        </div>
      </footer>

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

import { useState, type FormEvent } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bell,
  Loader2,
  Lock,
  MailCheck,
  RefreshCw,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import {
  BOOTSTRAPPED_ADMIN_EMAIL,
  getFriendlyAuthError,
  refreshCurrentUser,
  resendVerificationEmail,
  signInWithEmail,
  signInWithGoogle,
  signOutAccount,
  signUpWithEmail,
} from '../lib/auth';

export type PortalRole = 'user' | 'admin';

interface PortalEntryPageProps {
  selectedRole: PortalRole | null;
  onSelectRole: (role: PortalRole | null) => void;
  user: User | null;
  authLoading: boolean;
  isAdmin: boolean;
  onUserVerifiedRefresh: (refreshedUser: User | null) => void;
  onNotify: (variant: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export function PortalEntryPage({
  selectedRole,
  onSelectRole,
  user,
  authLoading,
  isAdmin,
  onUserVerifiedRefresh,
  onNotify,
}: PortalEntryPageProps) {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const resetFormState = () => {
    setAuthError(null);
    setPassword('');
    setConfirmPassword('');
  };

  const handleChooseRole = (role: PortalRole) => {
    resetFormState();
    onSelectRole(role);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (authMode === 'signup' && password !== confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (authMode === 'login') {
        await signInWithEmail(email, password);
        onNotify(
          'success',
          'Signed in',
          selectedRole === 'admin'
            ? 'Checking administrator permissions...'
            : 'Welcome to MIMO Announcements.'
        );
      } else {
        await signUpWithEmail(fullName, email, password);
        onNotify(
          'success',
          'Account created',
          selectedRole === 'admin'
            ? 'Account created. Verify your email address to activate admin access.'
            : 'Welcome to MIMO Announcements.'
        );
      }
    } catch (err) {
      setAuthError(getFriendlyAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      onNotify(
        'success',
        'Signed in with Google',
        selectedRole === 'admin'
          ? 'Verifying administrator privileges...'
          : 'Welcome to MIMO Announcements.'
      );
    } catch (err) {
      setAuthError(getFriendlyAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!user) return;
    try {
      await resendVerificationEmail(user);
      onNotify('info', 'Verification email sent', `Check your inbox at ${user.email}.`);
    } catch (err) {
      onNotify('error', 'Could not send email', getFriendlyAuthError(err));
    }
  };

  const handleRefreshVerification = async () => {
    setIsRefreshing(true);
    try {
      const updated = await refreshCurrentUser();
      onUserVerifiedRefresh(updated);
      if (updated?.emailVerified) {
        onNotify('success', 'Email verified', 'Checking your administrator permissions...');
      } else {
        onNotify('info', 'Not verified yet', 'Open the verification link in your email, then refresh.');
      }
    } catch (err) {
      onNotify('error', 'Refresh failed', getFriendlyAuthError(err));
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutAccount();
      onSelectRole(null);
      resetFormState();
      onNotify('info', 'Signed out', 'Returned to portal selection.');
    } catch (err) {
      onNotify('error', 'Sign out failed', getFriendlyAuthError(err));
    }
  };

  // Step 1: Ask User or Admin at the start
  if (!selectedRole) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="stagger-item stagger-delay-1 max-w-2xl mb-10">
          <p className="text-sm font-medium text-white/75 mb-2">
            MIMO Announcement Management System
          </p>
          <h1 className="text-white text-[40px] sm:text-[52px] leading-[1.06] font-normal tracking-[-0.03em] text-balance">
            Choose your portal
          </h1>
          <p className="text-base text-white/80 mt-3 leading-relaxed">
            Select whether you are signing in as a User to read live announcements or as an Administrator to manage notices.
          </p>
          {user && (
            <p className="text-xs text-white/75 mt-3">
              Signed in as <span className="font-medium text-white">{user.email}</span>
              <span className="mx-2 text-white/40" aria-hidden="true">·</span>
              <button
                type="button"
                onClick={handleSignOut}
                className="underline underline-offset-4 hover:text-white transition-colors cursor-pointer"
              >
                Sign out to use another account
              </button>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* User Portal Card */}
          <div className="stagger-item stagger-delay-2 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/20 p-8 flex flex-col justify-between text-white">
            <div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-6">
                <Bell size={22} />
              </div>
              <p className="text-xs font-medium text-white/75 mb-1.5">Public &amp; Member Access</p>
              <h2 className="text-2xl sm:text-3xl font-normal tracking-[-0.02em]">
                I am a User
              </h2>
              <p className="text-sm text-white/80 mt-3 leading-relaxed">
                Log in or create an account to view official published announcements, priority alerts, and scheduled maintenance updates in real time.
              </p>
            </div>

            <div className="pt-8 mt-8 border-t border-white/15">
              <button
                type="button"
                onClick={() => handleChooseRole('user')}
                className="w-full py-3.5 px-5 rounded-2xl bg-white text-neutral-800 text-sm font-medium shadow-lg hover:bg-neutral-100 transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>Continue as User</span>
                <ArrowRight size={18} className="text-neutral-700" />
              </button>
            </div>
          </div>

          {/* Admin Portal Card */}
          <div className="stagger-item stagger-delay-3 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/20 p-8 flex flex-col justify-between text-white">
            <div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-6">
                <ShieldCheck size={22} />
              </div>
              <p className="text-xs font-medium text-white/75 mb-1.5">Management Workspace</p>
              <h2 className="text-2xl sm:text-3xl font-normal tracking-[-0.02em]">
                I am an Admin
              </h2>
              <p className="text-sm text-white/80 mt-3 leading-relaxed">
                Sign in with administrator credentials to view admin details and create, edit, publish, or delete announcements synced to every user.
              </p>
            </div>

            <div className="pt-8 mt-8 border-t border-white/15">
              <button
                type="button"
                onClick={() => handleChooseRole('admin')}
                className="w-full py-3.5 px-5 rounded-2xl bg-white text-neutral-800 text-sm font-medium shadow-lg hover:bg-neutral-100 transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>Continue as Admin</span>
                <ArrowRight size={18} className="text-neutral-700" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isAdminRole = selectedRole === 'admin';

  // Step 2: Login or Sign Up for selected role (or Admin gate if signed in without admin privileges)
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
      <button
        type="button"
        onClick={() => {
          resetFormState();
          onSelectRole(null);
        }}
        className="stagger-item stagger-delay-1 inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white mb-8 cursor-pointer transition-colors"
      >
        <ArrowLeft size={16} />
        Switch role (User / Admin)
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Role Context Card */}
        <div className="stagger-item stagger-delay-2 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/20 text-white p-8 md:p-10 flex flex-col justify-between">
          <div>
            <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center mb-6">
              {isAdminRole ? <ShieldCheck size={22} /> : <UserIcon size={22} />}
            </div>
            <p className="text-sm font-medium text-white/75 mb-2">
              {isAdminRole ? 'MIMO Administration' : 'MIMO Announcements'}
            </p>
            <h1 className="text-[36px] sm:text-[42px] leading-[1.08] font-normal tracking-[-0.03em] text-balance">
              {isAdminRole ? 'Admin portal' : 'User portal'}
            </h1>
            <p className="text-base text-white/80 mt-3 leading-relaxed">
              {isAdminRole
                ? 'Log in or sign up to access your administrator details and create, edit, categorize, date, and delete platform announcements.'
                : 'Log in or sign up to access the dedicated announcements feed with real-time updates from MIMO administrators.'}
            </p>
          </div>

          <div className="pt-8 mt-8 border-t border-white/15 space-y-2.5 text-sm text-white/85">
            {isAdminRole ? (
              <>
                <p className="flex items-center justify-between">
                  <span>Create, edit &amp; delete notices</span>
                  <span className="text-[#CBD89E] font-semibold">Enabled</span>
                </p>
                <p className="flex items-center justify-between">
                  <span>General, Important &amp; Maintenance</span>
                  <span className="text-[#CBD89E] font-semibold">Supported</span>
                </p>
                <p className="flex items-center justify-between">
                  <span>Instant sync to User feed</span>
                  <span className="text-[#CBD89E] font-semibold">Live</span>
                </p>
              </>
            ) : (
              <>
                <p className="flex items-center justify-between">
                  <span>Live announcement feed</span>
                  <span className="text-[#CBD89E] font-semibold">Real time</span>
                </p>
                <p className="flex items-center justify-between">
                  <span>Category &amp; date filtering</span>
                  <span className="text-[#CBD89E] font-semibold">Active</span>
                </p>
                <p className="flex items-center justify-between">
                  <span>Instant admin updates</span>
                  <span className="text-[#CBD89E] font-semibold">Synced</span>
                </p>
              </>
            )}
          </div>
        </div>

        {/* Right Auth Card */}
        <div className="stagger-item stagger-delay-3 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/20 p-8 md:p-10 flex flex-col justify-center text-white">
          {authLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Loader2 size={28} className="animate-spin text-white mb-3" />
              <p className="text-sm font-medium text-white/85">Checking session...</p>
            </div>
          ) : isAdminRole && user && !user.emailVerified ? (
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-full bg-white/20 text-[#CBD89E] flex items-center justify-center">
                <MailCheck size={22} />
              </div>
              <h2 className="text-2xl font-normal tracking-[-0.02em]">
                Verify your email address
              </h2>
              <p className="text-sm text-white/80 leading-relaxed">
                Signed in as <span className="font-semibold text-white">{user.email}</span>. Administrator actions require a verified email address. Check your inbox for the verification link, or continue to the User announcements page.
              </p>
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  disabled={isRefreshing}
                  onClick={handleRefreshVerification}
                  className="w-full py-3 px-4 rounded-2xl bg-white text-neutral-800 text-sm font-medium shadow-lg hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isRefreshing ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <RefreshCw size={16} />
                  )}
                  I have verified — refresh status
                </button>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  className="w-full py-2.5 px-4 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  Resend verification email
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full py-2.5 px-4 rounded-2xl bg-transparent hover:bg-white/10 text-white/80 text-xs font-medium transition-colors cursor-pointer"
                >
                  Sign out and switch account
                </button>
              </div>
            </div>
          ) : isAdminRole && user && !isAdmin ? (
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-full bg-[#F5B5B6]/25 text-[#FFE4E5] flex items-center justify-center">
                <AlertTriangle size={22} />
              </div>
              <h2 className="text-2xl font-normal tracking-[-0.02em]">
                Administrator access required
              </h2>
              <p className="text-sm text-white/80 leading-relaxed">
                Signed in as <span className="font-semibold text-white">{user.email}</span>, which is not authorized for MIMO Admin access. Sign in with the administrator account ({BOOTSTRAPPED_ADMIN_EMAIL}) or switch to the User announcements portal.
              </p>
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full py-3.5 px-5 rounded-2xl bg-white text-neutral-800 text-sm font-medium shadow-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  Sign out and switch account
                </button>
                <button
                  type="button"
                  onClick={() => handleChooseRole('user')}
                  className="w-full py-3 px-4 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-sm font-medium transition-colors cursor-pointer"
                >
                  Open User Announcements instead
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Login / Sign Up Switcher */}
              <div className="flex items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <Lock size={18} className="text-[#CBD89E]" />
                  <h2 className="text-2xl font-normal tracking-[-0.02em]">
                    {authMode === 'login' ? 'Log in' : 'Sign up'}
                  </h2>
                </div>

                <div
                  className="inline-flex items-center gap-1 p-1 bg-white/15 rounded-full border border-white/20"
                  role="tablist"
                  aria-label="Authentication mode"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={authMode === 'login'}
                    onClick={() => {
                      setAuthMode('login');
                      setAuthError(null);
                    }}
                    className={`px-3.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      authMode === 'login'
                        ? 'bg-white text-neutral-800 shadow-sm'
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    Log in
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={authMode === 'signup'}
                    onClick={() => {
                      setAuthMode('signup');
                      setAuthError(null);
                    }}
                    className={`px-3.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      authMode === 'signup'
                        ? 'bg-white text-neutral-800 shadow-sm'
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    Sign up
                  </button>
                </div>
              </div>

              <p className="text-sm text-white/75 mb-5">
                {authMode === 'login'
                  ? `Sign in to your ${isAdminRole ? 'admin' : 'user'} account with email or Google.`
                  : `Create a new ${isAdminRole ? 'admin' : 'user'} account to get started.`}
              </p>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {authMode === 'signup' && (
                  <div>
                    <label
                      htmlFor="portal-full-name"
                      className="block text-xs font-medium text-white/80 mb-1.5"
                    >
                      Full Name
                    </label>
                    <input
                      id="portal-full-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Alex Rivera"
                      autoComplete="name"
                      className="w-full rounded-2xl bg-white/15 border border-white/25 px-4 py-3 text-sm text-white placeholder-white/50 outline-none focus:border-white/60"
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="portal-email"
                    className="block text-xs font-medium text-white/80 mb-1.5"
                  >
                    Email Address
                  </label>
                  <input
                    id="portal-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isAdminRole ? 'admin@mimo.org' : 'you@example.com'}
                    autoComplete="email"
                    required
                    className="w-full rounded-2xl bg-white/15 border border-white/25 px-4 py-3 text-sm text-white placeholder-white/50 outline-none focus:border-white/60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="portal-password"
                    className="block text-xs font-medium text-white/80 mb-1.5"
                  >
                    Password
                  </label>
                  <input
                    id="portal-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={authMode === 'signup' ? 'At least 6 characters' : 'Enter password'}
                    autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                    required
                    className="w-full rounded-2xl bg-white/15 border border-white/25 px-4 py-3 text-sm text-white placeholder-white/50 outline-none focus:border-white/60"
                  />
                </div>

                {authMode === 'signup' && (
                  <div>
                    <label
                      htmlFor="portal-confirm-password"
                      className="block text-xs font-medium text-white/80 mb-1.5"
                    >
                      Confirm Password
                    </label>
                    <input
                      id="portal-confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                      required
                      className="w-full rounded-2xl bg-white/15 border border-white/25 px-4 py-3 text-sm text-white placeholder-white/50 outline-none focus:border-white/60"
                    />
                  </div>
                )}

                {authError && (
                  <div
                    role="alert"
                    className="rounded-2xl bg-[#F5B5B6]/20 border border-[#F5B5B6]/45 p-3 text-xs text-[#FFE5E5] leading-relaxed"
                  >
                    {authError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-5 rounded-2xl bg-white text-neutral-800 text-sm font-medium shadow-lg hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-between"
                >
                  <span>
                    {isSubmitting
                      ? authMode === 'login'
                        ? 'Signing in...'
                        : 'Creating account...'
                      : authMode === 'login'
                        ? 'Log in with Email'
                        : 'Create account'}
                  </span>
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin text-neutral-700" />
                  ) : (
                    <ArrowRight size={18} className="text-neutral-700" />
                  )}
                </button>
              </form>

              <div className="flex items-center gap-3 my-5">
                <div className="h-px flex-1 bg-white/20" />
                <span className="text-xs text-white/65">or</span>
                <div className="h-px flex-1 bg-white/20" />
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleGoogleAuth}
                className="w-full py-3 px-4 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-sm font-medium transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2.5"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#ffffff"
                    d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z"
                  />
                </svg>
                Continue with Google
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

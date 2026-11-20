import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export const BOOTSTRAPPED_ADMIN_EMAILS = [
  'saketsasanka05@gmail.com',
  'chippesaket@gmail.com',
] as const;

export const BOOTSTRAPPED_ADMIN_EMAIL = BOOTSTRAPPED_ADMIN_EMAILS[0];

export function isBootstrappedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return (BOOTSTRAPPED_ADMIN_EMAILS as readonly string[]).includes(email.toLowerCase());
}

export function subscribeAuthState(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export async function checkIsAdmin(user: User | null): Promise<boolean> {
  if (!user || !user.emailVerified) {
    return false;
  }
  if (isBootstrappedAdminEmail(user.email)) {
    return true;
  }
  try {
    const adminSnap = await getDoc(doc(db, 'admins', user.uid));
    return adminSnap.exists();
  } catch {
    return false;
  }
}

export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const credential = await signInWithPopup(auth, provider);
  return credential.user;
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const trimmedEmail = email.trim();
  if (!trimmedEmail || !password) {
    throw new Error('Please enter both your email address and password.');
  }
  const credential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
  return credential.user;
}

export async function signUpWithEmail(
  fullName: string,
  email: string,
  password: string
): Promise<User> {
  const trimmedName = fullName.trim();
  const trimmedEmail = email.trim();
  if (!trimmedEmail || !password) {
    throw new Error('Please enter your email address and password.');
  }
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }
  const credential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
  if (trimmedName) {
    await updateProfile(credential.user, { displayName: trimmedName.slice(0, 80) });
  }
  try {
    await sendEmailVerification(credential.user);
  } catch {
    // Verification email send failure should not block account creation
  }
  return credential.user;
}

export async function resendVerificationEmail(user: User): Promise<void> {
  await sendEmailVerification(user);
}

export async function refreshCurrentUser(): Promise<User | null> {
  if (!auth.currentUser) return null;
  await reload(auth.currentUser);
  return auth.currentUser;
}

export async function signOutAccount(): Promise<void> {
  await signOut(auth);
}

export const signInAdminWithGoogle = signInWithGoogle;
export const signInAdminWithEmail = signInWithEmail;
export const signOutAdmin = signOutAccount;

export function getFriendlyAuthError(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : '';
  const message = error instanceof Error ? error.message : String(error);

  switch (code) {
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try logging in instead.';
    case 'auth/weak-password':
      return 'Choose a stronger password (at least 6 characters).';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please verify your credentials.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not enabled in Firebase Console. Use Google Sign-In below or enable Email/Password under Authentication > Sign-in method.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in window was closed before completing.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please allow popups and retry.';
    case 'auth/unauthorized-domain': {
      const host = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
      return `Domain "${host}" is not authorized for Google Sign-In. Add "${host}" in Firebase Console -> Authentication -> Settings -> Authorized domains.`;
    }
    case 'auth/network-request-failed':
      return 'Network error while connecting to authentication service.';
    default:
      return message || 'Authentication failed. Please try again.';
  }
}

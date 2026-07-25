import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

const FirebaseErrorMessage: Record<string, string> = {
  'invalid-email': 'Invalid email address format.',
  'user-not-found': 'No account found with this email.',
  'wrong-password': 'Incorrect password. Please try again.',
  'email-already-in-use': 'An account with this email already exists.',
  'weak-password': 'Password should be at least 8 characters.',
  'network-request-failed': 'Network error. Check your connection.',
  'too-many-requests': 'Too many attempts. Please try again later.',
  'user-disabled': 'This account has been disabled.',
  'popup-closed-by-user': 'Sign in cancelled.',
  'invalid-credential': 'Invalid email or password.',
  'missing-password': 'Password is required.',
};

export function getFirebaseErrorMessage(code: string): string {
  const key = code.replace(/^auth\//, '');
  return FirebaseErrorMessage[key] || 'An unexpected error occurred. Please try again.';
}

export async function signUpWithEmail(email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (cred.user) {
    await sendEmailVerification(cred.user);
  }
  return cred.user;
}

export async function signInWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const cred = await signInWithPopup(auth, provider);
  return cred.user;
}

export async function sendPasswordReset(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export async function resendVerificationEmail(user: FirebaseUser) {
  await sendEmailVerification(user);
}

export async function signOut() {
  await firebaseSignOut(auth);
}

export function getFirebaseIdToken(user: FirebaseUser): Promise<string> {
  return user.getIdToken();
}

export function onFirebaseAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

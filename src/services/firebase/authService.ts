import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import { firebaseAuth } from './firebaseConfig';
import { logger } from '@utils/logger';

const SCOPE = 'authService';

export function subscribeToAuthChanges(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(firebaseAuth, callback, (error) => {
    logger.error(SCOPE, 'Auth state listener error', error);
  });
}

export async function loginWithEmail(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
  return credential.user;
}

export async function logout(): Promise<void> {
  await signOut(firebaseAuth);
}

export function getCurrentUser(): User | null {
  return firebaseAuth.currentUser;
}

import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { subscribeToAuthChanges } from '@services/firebase/authService';
import type { AuthState } from '@app-types/user.types';

function mapFirebaseUser(user: User | null): AuthState['user'] {
  if (!user) return null;

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    role: 'viewer',
    createdAt: user.metadata.creationTime ?? null,
    lastLoginAt: user.metadata.lastSignInTime ?? null,
  };
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      setState({
        user: mapFirebaseUser(firebaseUser),
        isAuthenticated: firebaseUser !== null,
        isLoading: false,
        error: null,
      });
    });

    return unsubscribe;
  }, []);

  return state;
}

/**
 * @file HealthProfileContext.tsx
 * @description React Provider and hook for Personal Health Profile.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { PersonalHealthProfile, ProfileUpdatePayload } from '../types/healthProfile';
import { HealthProfileManager } from '../services/healthProfile/healthProfileManager';

interface HealthProfileContextType {
  profile: PersonalHealthProfile;
  updateProfile: (updates: ProfileUpdatePayload) => void;
  resetProfile: () => void;
  isLoading: boolean;
}

const HealthProfileContext = createContext<HealthProfileContextType | null>(null);

export const HealthProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<PersonalHealthProfile>(() => HealthProfileManager.loadProfile());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    const loaded = HealthProfileManager.loadProfile();
    setProfile(loaded);
    setIsLoading(false);
  }, []);

  const handleUpdate = useCallback((updates: ProfileUpdatePayload) => {
    const updated = HealthProfileManager.updateProfile(updates);
    setProfile(updated);
  }, []);

  const handleReset = useCallback(() => {
    const fresh = HealthProfileManager.resetProfile();
    setProfile(fresh);
  }, []);

  return (
    <HealthProfileContext.Provider
      value={{
        profile,
        updateProfile: handleUpdate,
        resetProfile: handleReset,
        isLoading,
      }}
    >
      {children}
    </HealthProfileContext.Provider>
  );
};

export const useHealthProfile = (): HealthProfileContextType => {
  const context = useContext(HealthProfileContext);
  if (!context) {
    throw new Error('useHealthProfile must be used within a HealthProfileProvider');
  }
  return context;
};

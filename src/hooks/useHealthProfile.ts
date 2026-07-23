/**
 * NOEXCUSE HPO V2 - Health Profile React Hook
 * React integration hook for reading and modifying Personal Health Profile state.
 */

import { useState, useEffect, useCallback } from 'react';
import { PersonalHealthProfile } from '../types/profile';
import { profileRepository } from '../services/profile/profileRepository';

export function useHealthProfile() {
  const [profile, setProfile] = useState<PersonalHealthProfile>(() => profileRepository.getProfile());

  useEffect(() => {
    setProfile(profileRepository.getProfile());

    const unsubscribe = profileRepository.subscribe((updatedProfile) => {
      setProfile(updatedProfile);
    });

    return unsubscribe;
  }, []);

  const updateProfile = useCallback((updates: Partial<PersonalHealthProfile>) => {
    return profileRepository.saveProfile(updates);
  }, []);

  const resetProfile = useCallback(() => {
    return profileRepository.resetProfile();
  }, []);

  return {
    profile,
    updateProfile,
    resetProfile,
    isConfigured: profile.isConfigured,
  };
}

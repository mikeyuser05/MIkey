/**
 * NOEXCUSE HPO V2 - Personal Health Profile Repository
 * Isolated storage management and change notifications for the Personal Health Profile.
 */

import { PersonalHealthProfile } from '../../types/profile';
import { validateAndSanitizeProfile, DEFAULT_HEALTH_PROFILE } from './profileValidator';

const PROFILE_STORAGE_KEY = 'noexcuse_hpo_health_profile_v2';

type ProfileChangeListener = (profile: PersonalHealthProfile) => void;

class ProfileRepository {
  private currentProfile: PersonalHealthProfile;
  private listeners: Set<ProfileChangeListener> = new Set();

  constructor() {
    this.currentProfile = this.loadFromStorage();
  }

  /**
   * Reads profile from local storage or loads fallback default if absent/corrupted.
   */
  private loadFromStorage(): PersonalHealthProfile {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return DEFAULT_HEALTH_PROFILE;
      }
      const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (!raw) {
        return DEFAULT_HEALTH_PROFILE;
      }
      const parsed = JSON.parse(raw);
      const validation = validateAndSanitizeProfile(parsed);
      return validation.sanitizedProfile;
    } catch {
      return DEFAULT_HEALTH_PROFILE;
    }
  }

  /**
   * Retrieves current active profile synchronously.
   */
  public getProfile(): PersonalHealthProfile {
    return { ...this.currentProfile };
  }

  /**
   * Validates and persists updated health profile.
   */
  public saveProfile(updated: Partial<PersonalHealthProfile>): PersonalHealthProfile {
    const merged: PersonalHealthProfile = {
      ...this.currentProfile,
      ...updated,
      updatedAt: Date.now(),
      isConfigured: true,
    };

    const validation = validateAndSanitizeProfile(merged);
    this.currentProfile = validation.sanitizedProfile;

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(this.currentProfile));
      }
    } catch (e) {
      console.warn('[ProfileRepository] Failed to persist profile to localStorage', e);
    }

    this.notifyListeners();
    return this.getProfile();
  }

  /**
   * Resets profile back to default configuration.
   */
  public resetProfile(): PersonalHealthProfile {
    this.currentProfile = { ...DEFAULT_HEALTH_PROFILE, updatedAt: Date.now() };
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(PROFILE_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('[ProfileRepository] Failed to reset profile in localStorage', e);
    }
    this.notifyListeners();
    return this.getProfile();
  }

  /**
   * Subscribes to profile state updates.
   */
  public subscribe(listener: ProfileChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const active = this.getProfile();
    this.listeners.forEach((listener) => {
      try {
        listener(active);
      } catch (err) {
        console.error('[ProfileRepository] Error notifying listener:', err);
      }
    });
  }
}

export const profileRepository = new ProfileRepository();

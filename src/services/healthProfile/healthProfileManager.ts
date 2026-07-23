/**
 * @file healthProfileManager.ts
 * @description Storage abstraction and business logic manager for Personal Health Profiles.
 */

import { PersonalHealthProfile, ProfileUpdatePayload } from '../../types/healthProfile';
import { createDefaultProfile, generateDefaultBaselines, CURRENT_PROFILE_SCHEMA_VERSION } from './healthProfileDefaults';

const STORAGE_KEY = 'noexcuse_hpo_health_profile_v1';

export class HealthProfileManager {
  private static cachedProfile: PersonalHealthProfile | null = null;

  public static loadProfile(): PersonalHealthProfile {
    if (this.cachedProfile) {
      return this.cachedProfile;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const defaultProfile = createDefaultProfile();
        this.saveProfile(defaultProfile);
        return defaultProfile;
      }
      const parsed: PersonalHealthProfile = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || !parsed.baselines) {
        throw new Error('Invalid profile payload shape');
      }
      this.cachedProfile = parsed;
      return parsed;
    } catch (err) {
      console.warn('[HealthProfileManager] Failed to load profile, resetting to default:', err);
      const fallback = createDefaultProfile();
      this.saveProfile(fallback);
      return fallback;
    }
  }

  public static saveProfile(profile: PersonalHealthProfile): void {
    const updated: PersonalHealthProfile = {
      ...profile,
      meta: {
        ...profile.meta,
        updatedAt: new Date().toISOString(),
        version: CURRENT_PROFILE_SCHEMA_VERSION,
      },
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('[HealthProfileManager] LocalStorage write failed:', err);
    }
    this.cachedProfile = updated;
  }

  public static updateProfile(updates: ProfileUpdatePayload): PersonalHealthProfile {
    const current = this.loadProfile();
    const newAge = updates.age !== undefined ? updates.age : current.age;
    const newSex = updates.sex !== undefined ? updates.sex : current.sex;
    const ageOrSexChanged = newAge !== current.age || newSex !== current.sex;

    const autoBaselines = ageOrSexChanged
      ? generateDefaultBaselines(newAge, newSex)
      : current.baselines;

    const updatedProfile: PersonalHealthProfile = {
      ...current,
      ...updates,
      age: newAge,
      sex: newSex,
      baselines: {
        ...autoBaselines,
        ...current.baselines,
        ...(updates.baselines || {}),
      },
      medicalContext: {
        ...current.medicalContext,
        ...(updates.medicalContext || {}),
      },
      meta: {
        ...current.meta,
        updatedAt: new Date().toISOString(),
      },
    };

    this.saveProfile(updatedProfile);
    return updatedProfile;
  }

  public static resetProfile(): PersonalHealthProfile {
    const fresh = createDefaultProfile();
    this.saveProfile(fresh);
    return fresh;
  }
}

/**
 * @file healthProfileDefaults.ts
 * @description Deterministic algorithms to compute age-adjusted physiological baselines.
 */

import { BiologicalSex, PersonalHealthProfile, PhysiologicalBaselines } from '../../types/healthProfile';

export const CURRENT_PROFILE_SCHEMA_VERSION = 1;

export function calculateTanakaMaxHR(age: number): number {
  const boundedAge = Math.max(1, Math.min(120, age));
  return Math.round(208 - (0.7 * boundedAge));
}

export function getDefaultRestingHR(age: number, sex: BiologicalSex): number {
  let baseRHR = 70;
  if (age < 18) {
    baseRHR = 75;
  } else if (age > 65) {
    baseRHR = 68;
  }
  if (sex === 'female') {
    baseRHR += 3;
  }
  return baseRHR;
}

export function generateDefaultBaselines(age: number = 30, sex: BiologicalSex = 'unspecified'): PhysiologicalBaselines {
  return {
    restingHeartRate: getDefaultRestingHR(age, sex),
    maxHeartRate: calculateTanakaMaxHR(age),
    restingSpO2: 98,
    dailyStepTarget: 10000,
  };
}

export function createDefaultProfile(id: string = 'default-user'): PersonalHealthProfile {
  const defaultAge = 30;
  const defaultSex: BiologicalSex = 'unspecified';
  const now = new Date().toISOString();

  return {
    id,
    displayName: 'Default User',
    age: defaultAge,
    sex: defaultSex,
    activityLevel: 'moderately_active',
    baselines: generateDefaultBaselines(defaultAge, defaultSex),
    medicalContext: {},
    meta: {
      version: CURRENT_PROFILE_SCHEMA_VERSION,
      createdAt: now,
      updatedAt: now,
      isCalibrated: false,
    },
  };
}

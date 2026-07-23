/**
 * @file healthProfile.ts
 * @description Core domain interfaces for NOEXCUSE HPO V2 Personal Health Profile.
 */

export type BiologicalSex = 'male' | 'female' | 'other' | 'unspecified';

export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';

export interface PhysiologicalBaselines {
  restingHeartRate: number;
  maxHeartRate: number;
  restingSpO2: number;
  dailyStepTarget: number;
  customHRLowerBound?: number;
  customHRUpperBound?: number;
}

export interface MedicalContextFlags {
  hasHypertension?: boolean;
  hasAsthmaOrCOPD?: boolean;
  hasArrhythmia?: boolean;
  isSmoker?: boolean;
  notes?: string;
}

export interface ProfileMetaData {
  version: number;
  createdAt: string;
  updatedAt: string;
  isCalibrated: boolean;
}

export interface PersonalHealthProfile {
  id: string;
  displayName: string;
  age: number;
  sex: BiologicalSex;
  heightCm?: number;
  weightKg?: number;
  activityLevel: ActivityLevel;
  baselines: PhysiologicalBaselines;
  medicalContext: MedicalContextFlags;
  meta: ProfileMetaData;
}

export type ProfileUpdatePayload = Partial<Omit<PersonalHealthProfile, 'id' | 'meta'>> & {
  baselines?: Partial<PhysiologicalBaselines>;
  medicalContext?: Partial<MedicalContextFlags>;
};

/**
 * NOEXCUSE HPO V2 - Personal Health Profile Domain Types
 * Phase PR5.1: Personal Health Profile Architecture
 */

export type BiologicalSex = 'male' | 'female' | 'other' | 'unspecified';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';

export interface DemographicData {
  age: number; // In years (1 - 120)
  biologicalSex: BiologicalSex;
  weightKg: number; // Weight in kilograms (20 - 300)
  heightCm: number; // Height in centimeters (50 - 250)
}

export interface StatedBaselineRanges {
  expectedRestingHrMin: number; // e.g., 50 bpm (30 - 140)
  expectedRestingHrMax: number; // e.g., 80 bpm (HR Min - 220)
  expectedBaselineSpo2Min: number; // e.g., 95% (70 - 100)
  expectedBaselineSpo2Max: number; // e.g., 100% (SpO2 Min - 100)
}

export interface KnownConditions {
  hasCardiovascularCondition: boolean;
  hasRespiratoryCondition: boolean;
  notes?: string;
}

export interface PersonalHealthProfile {
  id: string; // Unique profile identifier
  updatedAt: number; // Unix timestamp (ms)
  demographics: DemographicData;
  statedBaselines: StatedBaselineRanges;
  activityLevel: ActivityLevel;
  conditions: KnownConditions;
  isConfigured: boolean; // Flag to indicate whether user completed profile setup
}

export interface ProfileValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedProfile: PersonalHealthProfile;
}

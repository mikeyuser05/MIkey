/**
 * NOEXCUSE HPO V2 - Personal Health Profile Validator
 * Deterministic validation and fallback rules for Health Profiles.
 */

import { PersonalHealthProfile, ProfileValidationResult } from '../../types/profile';

export const DEFAULT_HEALTH_PROFILE: PersonalHealthProfile = {
  id: 'default_user_profile',
  updatedAt: Date.now(),
  demographics: {
    age: 30,
    biologicalSex: 'unspecified',
    weightKg: 70,
    heightCm: 170,
  },
  statedBaselines: {
    expectedRestingHrMin: 60,
    expectedRestingHrMax: 100,
    expectedBaselineSpo2Min: 95,
    expectedBaselineSpo2Max: 100,
  },
  activityLevel: 'moderate',
  conditions: {
    hasCardiovascularCondition: false,
    hasRespiratoryCondition: false,
  },
  isConfigured: false,
};

/**
 * Validates and sanitizes raw profile input, ensuring physical bounds
 * are within realistic parameters. Safely falls back if values are corrupt or invalid.
 */
export function validateAndSanitizeProfile(rawInput: Partial<PersonalHealthProfile> | null | undefined): ProfileValidationResult {
  const errors: string[] = [];

  if (!rawInput) {
    return {
      isValid: false,
      errors: ['Profile input is empty or null. Using default baseline profile.'],
      sanitizedProfile: { ...DEFAULT_HEALTH_PROFILE, updatedAt: Date.now() },
    };
  }

  // Age validation
  let age = rawInput.demographics?.age ?? DEFAULT_HEALTH_PROFILE.demographics.age;
  if (typeof age !== 'number' || age < 1 || age > 120) {
    errors.push(`Invalid age (${age}). Must be between 1 and 120.`);
    age = DEFAULT_HEALTH_PROFILE.demographics.age;
  }

  // Weight validation
  let weightKg = rawInput.demographics?.weightKg ?? DEFAULT_HEALTH_PROFILE.demographics.weightKg;
  if (typeof weightKg !== 'number' || weightKg < 20 || weightKg > 300) {
    errors.push(`Invalid weight (${weightKg} kg). Must be between 20kg and 300kg.`);
    weightKg = DEFAULT_HEALTH_PROFILE.demographics.weightKg;
  }

  // Height validation
  let heightCm = rawInput.demographics?.heightCm ?? DEFAULT_HEALTH_PROFILE.demographics.heightCm;
  if (typeof heightCm !== 'number' || heightCm < 50 || heightCm > 250) {
    errors.push(`Invalid height (${heightCm} cm). Must be between 50cm and 250cm.`);
    heightCm = DEFAULT_HEALTH_PROFILE.demographics.heightCm;
  }

  // Resting HR Min/Max validation
  let hrMin = rawInput.statedBaselines?.expectedRestingHrMin ?? DEFAULT_HEALTH_PROFILE.statedBaselines.expectedRestingHrMin;
  let hrMax = rawInput.statedBaselines?.expectedRestingHrMax ?? DEFAULT_HEALTH_PROFILE.statedBaselines.expectedRestingHrMax;

  if (typeof hrMin !== 'number' || hrMin < 30 || hrMin > 140) {
    errors.push(`Invalid expected minimum resting HR (${hrMin}). Must be between 30 and 140 bpm.`);
    hrMin = DEFAULT_HEALTH_PROFILE.statedBaselines.expectedRestingHrMin;
  }

  if (typeof hrMax !== 'number' || hrMax < hrMin || hrMax > 220) {
    errors.push(`Invalid expected maximum resting HR (${hrMax}). Must be greater than HR min (${hrMin}) and under 220 bpm.`);
    hrMax = Math.max(hrMin + 20, DEFAULT_HEALTH_PROFILE.statedBaselines.expectedRestingHrMax);
  }

  // SpO2 Min/Max validation
  let spo2Min = rawInput.statedBaselines?.expectedBaselineSpo2Min ?? DEFAULT_HEALTH_PROFILE.statedBaselines.expectedBaselineSpo2Min;
  let spo2Max = rawInput.statedBaselines?.expectedBaselineSpo2Max ?? DEFAULT_HEALTH_PROFILE.statedBaselines.expectedBaselineSpo2Max;

  if (typeof spo2Min !== 'number' || spo2Min < 70 || spo2Min > 100) {
    errors.push(`Invalid expected minimum SpO2 (${spo2Min}%). Must be between 70% and 100%.`);
    spo2Min = DEFAULT_HEALTH_PROFILE.statedBaselines.expectedBaselineSpo2Min;
  }

  if (typeof spo2Max !== 'number' || spo2Max < spo2Min || spo2Max > 100) {
    errors.push(`Invalid expected maximum SpO2 (${spo2Max}%). Must be between SpO2 min (${spo2Min}%) and 100%.`);
    spo2Max = 100;
  }

  const sanitizedProfile: PersonalHealthProfile = {
    id: rawInput.id && typeof rawInput.id === 'string' ? rawInput.id : DEFAULT_HEALTH_PROFILE.id,
    updatedAt: typeof rawInput.updatedAt === 'number' ? rawInput.updatedAt : Date.now(),
    demographics: {
      age,
      biologicalSex: rawInput.demographics?.biologicalSex || DEFAULT_HEALTH_PROFILE.demographics.biologicalSex,
      weightKg,
      heightCm,
    },
    statedBaselines: {
      expectedRestingHrMin: hrMin,
      expectedRestingHrMax: hrMax,
      expectedBaselineSpo2Min: spo2Min,
      expectedBaselineSpo2Max: spo2Max,
    },
    activityLevel: rawInput.activityLevel || DEFAULT_HEALTH_PROFILE.activityLevel,
    conditions: {
      hasCardiovascularCondition: Boolean(rawInput.conditions?.hasCardiovascularCondition),
      hasRespiratoryCondition: Boolean(rawInput.conditions?.hasRespiratoryCondition),
      notes: rawInput.conditions?.notes ? String(rawInput.conditions.notes).slice(0, 500) : undefined,
    },
    isConfigured: typeof rawInput.isConfigured === 'boolean' ? rawInput.isConfigured : true,
  };

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedProfile,
  };
}

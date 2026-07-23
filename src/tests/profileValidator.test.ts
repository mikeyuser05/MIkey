/**
 * NOEXCUSE HPO V2 - Health Profile Validator Unit Tests
 */

import { validateAndSanitizeProfile, DEFAULT_HEALTH_PROFILE } from '../services/profile/profileValidator';

describe('profileValidator', () => {
  it('returns default profile when input is null or undefined', () => {
    const res = validateAndSanitizeProfile(null);
    expect(res.isValid).toBe(false);
    expect(res.sanitizedProfile.demographics.age).toBe(DEFAULT_HEALTH_PROFILE.demographics.age);
  });

  it('correctly validates and accepts valid profile input', () => {
    const validInput = {
      id: 'user_123',
      demographics: {
        age: 45,
        biologicalSex: 'female' as const,
        weightKg: 65,
        heightCm: 165,
      },
      statedBaselines: {
        expectedRestingHrMin: 55,
        expectedRestingHrMax: 85,
        expectedBaselineSpo2Min: 96,
        expectedBaselineSpo2Max: 99,
      },
      activityLevel: 'active' as const,
      conditions: {
        hasCardiovascularCondition: false,
        hasRespiratoryCondition: false,
      },
      isConfigured: true,
    };

    const res = validateAndSanitizeProfile(validInput);
    expect(res.isValid).toBe(true);
    expect(res.errors).toHaveLength(0);
    expect(res.sanitizedProfile.demographics.age).toBe(45);
    expect(res.sanitizedProfile.statedBaselines.expectedRestingHrMin).toBe(55);
  });

  it('sanitizes out-of-bounds parameters safely to defaults', () => {
    const invalidInput = {
      demographics: {
        age: 200,
        weightKg: 5,
        heightCm: 300,
        biologicalSex: 'male' as const,
      },
      statedBaselines: {
        expectedRestingHrMin: 10,
        expectedRestingHrMax: 300,
        expectedBaselineSpo2Min: 50,
        expectedBaselineSpo2Max: 105,
      },
    };

    const res = validateAndSanitizeProfile(invalidInput);
    expect(res.isValid).toBe(false);
    expect(res.errors.length).toBeGreaterThan(0);
    expect(res.sanitizedProfile.demographics.age).toBe(DEFAULT_HEALTH_PROFILE.demographics.age);
    expect(res.sanitizedProfile.demographics.weightKg).toBe(DEFAULT_HEALTH_PROFILE.demographics.weightKg);
    expect(res.sanitizedProfile.statedBaselines.expectedRestingHrMin).toBe(DEFAULT_HEALTH_PROFILE.statedBaselines.expectedRestingHrMin);
    expect(res.sanitizedProfile.statedBaselines.expectedBaselineSpo2Max).toBe(100);
  });
});

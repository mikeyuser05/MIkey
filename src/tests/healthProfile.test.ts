import { calculateTanakaMaxHR, getDefaultRestingHR } from '../services/healthProfile/healthProfileDefaults';
import { HealthProfileManager } from '../services/healthProfile/healthProfileManager';

describe('PR5.1 — Personal Health Profile Architecture', () => {
  beforeEach(() => {
    localStorage.clear();
    // @ts-ignore
    HealthProfileManager.cachedProfile = null;
  });

  test('calculateTanakaMaxHR derives correct HR max for standard ages', () => {
    expect(calculateTanakaMaxHR(30)).toBe(187);
    expect(calculateTanakaMaxHR(50)).toBe(173);
    expect(calculateTanakaMaxHR(200)).toBe(124);
  });

  test('getDefaultRestingHR accounts for sex difference', () => {
    const maleRHR = getDefaultRestingHR(30, 'male');
    const femaleRHR = getDefaultRestingHR(30, 'female');
    expect(femaleRHR - maleRHR).toBe(3);
  });

  test('HealthProfileManager initializes default profile in storage when empty', () => {
    const profile = HealthProfileManager.loadProfile();
    expect(profile.id).toBe('default-user');
    expect(profile.baselines.maxHeartRate).toBe(187);
    expect(profile.meta.isCalibrated).toBe(false);
  });

  test('HealthProfileManager updates profile and recalculates Tanaka max HR when age changes', () => {
    HealthProfileManager.loadProfile();
    const updated = HealthProfileManager.updateProfile({ age: 50 });
    expect(updated.age).toBe(50);
    expect(updated.baselines.maxHeartRate).toBe(173);
  });
});

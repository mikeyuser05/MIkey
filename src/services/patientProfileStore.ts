import { PatientProfile } from '../types/pr36Patient';

const STORAGE_KEY = 'HPO_PATIENT_PROFILE_PR36';

const DEFAULT_PATIENT: PatientProfile = {
  id: 'PT-10892',
  fullName: 'Alex Vance',
  age: 28,
  gender: 'MALE',
  bloodGroup: 'O+',
  conditions: ['Mild Asthma'],
  medications: ['Inhaler (as needed)'],
  baselineVitals: {
    restingHeartRate: 72,
    baselineSpO2: 98,
    baselineTemp: 36.8,
    baselineGasLevel: 450,
  },
  updatedAt: new Date().toISOString(),
};

class PatientProfileStore {
  private profile: PatientProfile;

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY);
    this.profile = saved ? JSON.parse(saved) : DEFAULT_PATIENT;
  }

  getProfile(): PatientProfile {
    return { ...this.profile };
  }

  updateProfile(updated: Partial<PatientProfile>): PatientProfile {
    this.profile = {
      ...this.profile,
      ...updated,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
    return this.getProfile();
  }
}

export const patientProfileStore = new PatientProfileStore();
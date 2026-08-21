export interface BaselineVitals {
  restingHeartRate: number;
  baselineSpO2: number;
  baselineTemp: number;
  baselineGasLevel: number;
}

export interface PatientProfile {
  id: string;
  fullName: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup: string;
  conditions: string[];
  medications: string[];
  baselineVitals: BaselineVitals;
  updatedAt: string;
}
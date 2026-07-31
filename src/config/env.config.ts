export interface EnvironmentConfig {
  firebaseApiKey: string;
  firebaseAuthDomain: string;
  firebaseDatabaseURL: string;
  firebaseProjectId: string;
  firebaseStorageBucket: string;
  firebaseMessagingSenderId: string;
  firebaseAppId: string;
  appName: string;
  isProduction: boolean;
  isDev: boolean;
}

const getEnvVar = (key: string, defaultValue: string = ''): string => {
  return import.meta.env[key] || defaultValue;
};

export const envConfig: EnvironmentConfig = {
  firebaseApiKey: getEnvVar('VITE_FIREBASE_API_KEY', 'AIzaSyDkO-RoOuj6-CzVHUbLVL3r5Be-gQmRLnQ'),
  firebaseAuthDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN', 'mikey-hpo.firebaseapp.com'),
  firebaseDatabaseURL: getEnvVar('VITE_FIREBASE_DATABASE_URL', 'https://mikey-hpo-default-rtdb.asia-southeast1.firebasedatabase.app'),
  firebaseProjectId: getEnvVar('VITE_FIREBASE_PROJECT_ID', 'mikey-hpo'),
  firebaseStorageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET', 'mikey-hpo.firebasestorage.app'),
  firebaseMessagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID', '918473474291'),
  firebaseAppId: getEnvVar('VITE_FIREBASE_APP_ID', '1:918473474291:web:3092d4a4792d8e2748f786'),
  appName: getEnvVar('VITE_APP_NAME', 'NOEXCUSE HPO V2'),
  isProduction: import.meta.env.PROD,
  isDev: import.meta.env.DEV,
};

export const validateEnvConfig = (): { isValid: boolean; missingKeys: string[] } => {
  const requiredKeys = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_DATABASE_URL',
    'VITE_FIREBASE_PROJECT_ID',
  ];

  const missingKeys = requiredKeys.filter((key) => !import.meta.env[key] && !envConfig.firebaseProjectId);

  return {
    isValid: missingKeys.length === 0,
    missingKeys,
  };
};

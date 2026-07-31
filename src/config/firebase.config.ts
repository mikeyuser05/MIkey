import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { envConfig, validateEnvConfig } from './env.config';

let firebaseApp: FirebaseApp | null = null;
let firebaseDb: Database | null = null;

const envValidation = validateEnvConfig();

if (!envValidation.isValid) {
  console.warn(
    `[Firebase Setup Warning]: Missing critical environment variables: ${envValidation.missingKeys.join(
      ', '
    )}. Running in fallback/simulation mode.`
  );
} else {
  try {
    const firebaseConfig = {
      apiKey: envConfig.firebaseApiKey,
      authDomain: envConfig.firebaseAuthDomain,
      databaseURL: envConfig.firebaseDatabaseURL,
      projectId: envConfig.firebaseProjectId,
      storageBucket: envConfig.firebaseStorageBucket,
      messagingSenderId: envConfig.firebaseMessagingSenderId,
      appId: envConfig.firebaseAppId,
    };

    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    firebaseDb = getDatabase(firebaseApp);
    console.log(`[Firebase Init]: Production Realtime DB connected (Project: ${envConfig.firebaseProjectId})`);
  } catch (error) {
    console.error('[Firebase Init Error]: Failed to initialize Firebase app:', error);
  }
}

export { firebaseApp, firebaseDb };

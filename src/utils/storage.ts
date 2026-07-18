import { logger } from './logger';

const SCOPE = 'storage';

export function getStorageItem<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    logger.warn(SCOPE, `Failed to read key "${key}"`, error);
    return fallback;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    logger.warn(SCOPE, `Failed to write key "${key}"`, error);
  }
}

export function removeStorageItem(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    logger.warn(SCOPE, `Failed to remove key "${key}"`, error);
  }
}

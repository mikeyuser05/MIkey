/**
 * NOEXCUSE HPO V2 - Emergency Preferences Store
 * Manages user emergency preferences, calling toggles, and emergency contact registry.
 */

import { EmergencyPreferences, EmergencyContact } from '../types/pr11Triage';

const PREFS_STORAGE_KEY = 'noexcuse_hpo_v2_emergency_preferences';

const DEFAULT_PREFERENCES: EmergencyPreferences = {
  emergencyCallingEnabled: false, // Default DISABLED for safety
  autoEscalationTimeoutSeconds: 30,
  contacts: [],
  suppressionWindowMinutes: 15
};

class EmergencyPreferencesStore {
  private preferences: EmergencyPreferences;

  constructor() {
    this.preferences = this.loadPreferences();
  }

  public getPreferences(): EmergencyPreferences {
    return { ...this.preferences };
  }

  public updatePreferences(newPrefs: Partial<EmergencyPreferences>): void {
    this.preferences = {
      ...this.preferences,
      ...newPrefs
    };
    this.savePreferences();
  }

  public addContact(contact: Omit<EmergencyContact, 'id'>): EmergencyContact {
    const newContact: EmergencyContact = {
      ...contact,
      id: `CONT_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    };

    // If marked primary, unmark existing primary contacts
    if (newContact.isPrimary) {
      this.preferences.contacts.forEach(c => c.isPrimary = false);
    }

    this.preferences.contacts.push(newContact);
    this.savePreferences();
    return newContact;
  }

  public removeContact(contactId: string): void {
    this.preferences.contacts = this.preferences.contacts.filter(c => c.id !== contactId);
    this.savePreferences();
  }

  public getPrimaryContact(): EmergencyContact | null {
    return this.preferences.contacts.find(c => c.isPrimary && c.enabled) || 
           this.preferences.contacts.find(c => c.enabled) || null;
  }

  private loadPreferences(): EmergencyPreferences {
    try {
      const stored = localStorage.getItem(PREFS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load emergency preferences from storage, using defaults', e);
    }
    return DEFAULT_PREFERENCES;
  }

  private savePreferences(): void {
    try {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(this.preferences));
    } catch (e) {
      console.error('Failed to save emergency preferences', e);
    }
  }
}

export const emergencyPreferencesStore = new EmergencyPreferencesStore();

/**
 * NOEXCUSE HPO V2 - Baseline Storage Repository
 * Decoupled persistence and subscription manager for personal baseline states.
 */

import { PersonalBaselineState } from '../../types/baseline';
import { defaultBaselineEngine, BaselineEngine } from './baselineEngine';
import { ValidatedTelemetryPacket } from '../sqi/sqiFilter';

const BASELINE_STORAGE_KEY = 'noexcuse_hpo_personal_baseline_v2';

type BaselineChangeListener = (state: PersonalBaselineState) => void;

class BaselineRepository {
  private currentState: PersonalBaselineState;
  private engine: BaselineEngine;
  private listeners: Set<BaselineChangeListener> = new Set();

  constructor(engine: BaselineEngine = defaultBaselineEngine) {
    this.engine = engine;
    this.currentState = this.loadFromStorage();
  }

  private loadFromStorage(): PersonalBaselineState {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return this.engine.createEmptyState();
      }
      const raw = localStorage.getItem(BASELINE_STORAGE_KEY);
      if (!raw) {
        return this.engine.createEmptyState();
      }
      return JSON.parse(raw) as PersonalBaselineState;
    } catch {
      return this.engine.createEmptyState();
    }
  }

  public getBaseline(): PersonalBaselineState {
    return { ...this.currentState };
  }

  public processValidatedPackets(packets: ValidatedTelemetryPacket[]): PersonalBaselineState {
    this.currentState = this.engine.accumulateBatch(this.currentState, packets);
    this.saveToStorage();
    this.notifyListeners();
    return this.getBaseline();
  }

  public resetBaseline(): PersonalBaselineState {
    this.currentState = this.engine.createEmptyState();
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(BASELINE_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('[BaselineRepository] Failed to reset storage', e);
    }
    this.notifyListeners();
    return this.getBaseline();
  }

  public subscribe(listener: BaselineChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private saveToStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(BASELINE_STORAGE_KEY, JSON.stringify(this.currentState));
      }
    } catch (e) {
      console.warn('[BaselineRepository] Failed to save baseline state', e);
    }
  }

  private notifyListeners(): void {
    const active = this.getBaseline();
    this.listeners.forEach((listener) => {
      try {
        listener(active);
      } catch (err) {
        console.error('[BaselineRepository] Error notifying baseline listener:', err);
      }
    });
  }
}

export const baselineRepository = new BaselineRepository();

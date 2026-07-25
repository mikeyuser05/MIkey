/**
 * NOEXCUSE HPO V2 - Emergency Policy Engine
 * Deterministic rules-based evaluation engine for emergency actions.
 * ABSOLUTELY NO LLM INTERFERENCE IN EMERGENCY DISPATCH DECISIONS.
 */

import { AlertEvaluationResult, EmergencyContact } from '../types/pr11Triage';
import { emergencyPreferencesStore } from './emergencyPreferencesStore';
import { emergencyStateMachine } from './emergencyStateMachine';

export interface PolicyDecision {
  actionEligible: boolean;
  reason: string;
  targetContact: EmergencyContact | null;
  timestamp: number;
}

export class EmergencyPolicyEngine {
  /**
   * Evaluates if an emergency evaluation is eligible for dispatch action.
   */
  public evaluatePolicy(
    evaluation: AlertEvaluationResult,
    currentTimeMs: number = Date.now()
  ): PolicyDecision {
    const prefs = emergencyPreferencesStore.getPreferences();

    // 1. Verify Emergency Calling Global Switch
    if (!prefs.emergencyCallingEnabled) {
      return {
        actionEligible: false,
        reason: 'Emergency dispatch blocked: Emergency Calling is disabled in user preferences.',
        targetContact: null,
        timestamp: currentTimeMs
      };
    }

    // 2. Verify Configured and Enabled Primary Contact
    const targetContact = emergencyPreferencesStore.getPrimaryContact();
    if (!targetContact) {
      return {
        actionEligible: false,
        reason: 'Emergency dispatch blocked: No enabled emergency contact configured.',
        targetContact: null,
        timestamp: currentTimeMs
      };
    }

    // 3. Verify State Machine State
    const currentState = emergencyStateMachine.getState();
    if (currentState !== 'EMERGENCY') {
      return {
        actionEligible: false,
        reason: `Emergency dispatch blocked: System state is '${currentState}' (must be 'EMERGENCY').`,
        targetContact: null,
        timestamp: currentTimeMs
      };
    }

    // 4. Verify Data Quality
    if (evaluation.quality !== 'VALID') {
      return {
        actionEligible: false,
        reason: `Emergency dispatch blocked: Data quality degradation detected ('${evaluation.quality}').`,
        targetContact: null,
        timestamp: currentTimeMs
      };
    }

    // 5. Verify Action Eligibility (Prevent duplicate dispatch)
    if (!emergencyStateMachine.canDispatchAction(evaluation.id)) {
      return {
        actionEligible: false,
        reason: 'Emergency dispatch blocked: Action already triggered for this emergency cycle.',
        targetContact,
        timestamp: currentTimeMs
      };
    }

    // All Policy Rules Passed
    return {
      actionEligible: true,
      reason: 'Emergency action policy passed. Qualified for dispatch.',
      targetContact,
      timestamp: currentTimeMs
    };
  }
}

export const emergencyPolicyEngine = new EmergencyPolicyEngine();

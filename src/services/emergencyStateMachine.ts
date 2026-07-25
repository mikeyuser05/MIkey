/**
 * NOEXCUSE HPO V2 - Emergency State Machine
 * Manages deterministic state lifecycle transitions and prevents duplicate action dispatches.
 */

import { AlertEvaluationResult, AlertState } from '../types/pr11Triage';

export interface StateTransitionRecord {
  id: string;
  previousState: AlertState;
  newState: AlertState;
  timestamp: number;
  reason: string;
  nodeId: string;
  actionTriggered: boolean;
}

class EmergencyStateMachine {
  private currentState: AlertState = 'NORMAL';
  private activeEmergencyId: string | null = null;
  private actionDispatchedMap: Map<string, boolean> = new Map();
  private transitionHistory: StateTransitionRecord[] = [];

  public getState(): AlertState {
    return this.currentState;
  }

  public getHistory(): StateTransitionRecord[] {
    return [...this.transitionHistory];
  }

  /**
   * Processes evaluated triage results and executes valid state transitions.
   */
  public evaluateState(
    evaluations: AlertEvaluationResult[],
    currentTimeMs: number = Date.now()
  ): AlertState {
    // Determine highest priority state from active evaluations
    const highestPriorityEval = this.getHighestPriorityEvaluation(evaluations);

    if (!highestPriorityEval) {
      if (this.currentState !== 'NORMAL' && this.currentState !== 'SUPPRESSED') {
        this.transitionTo('NORMAL', 'Telemetry returned to normal physiological parameters', 'SYSTEM', currentTimeMs);
      }
      return this.currentState;
    }

    const targetState = highestPriorityEval.state;

    // Transition Logic Rules
    if (this.currentState === 'SUPPRESSED') {
      // Manual suppression active - maintain until user or system clears
      return this.currentState;
    }

    if (this.currentState === 'ACKNOWLEDGED' && targetState !== 'NORMAL') {
      // Acknowledged state remains until condition clears or escalates further
      if (highestPriorityEval.severity === 'CRITICAL' && targetState === 'EMERGENCY') {
        // Condition escalated past initial acknowledgment
        this.transitionTo('EMERGENCY', highestPriorityEval.reason, highestPriorityEval.nodeId, currentTimeMs);
      }
      return this.currentState;
    }

    if (this.currentState !== targetState) {
      this.transitionTo(targetState, highestPriorityEval.reason, highestPriorityEval.nodeId, currentTimeMs);
    }

    return this.currentState;
  }

  /**
   * Manual User Actions
   */
  public acknowledge(reason: string = 'User acknowledged alert', currentTimeMs: number = Date.now()): void {
    if (this.currentState === 'WARNING' || this.currentState === 'ESCALATING' || this.currentState === 'EMERGENCY') {
      this.transitionTo('ACKNOWLEDGED', reason, 'USER_ACTION', currentTimeMs);
    }
  }

  public suppress(reason: string = 'User temporarily muted alert', currentTimeMs: number = Date.now()): void {
    this.transitionTo('SUPPRESSED', reason, 'USER_ACTION', currentTimeMs);
  }

  public resolve(reason: string = 'Condition manually resolved by operator', currentTimeMs: number = Date.now()): void {
    this.transitionTo('RESOLVED', reason, 'USER_ACTION', currentTimeMs);
    // Transition back to NORMAL for next telemetry cycle
    this.transitionTo('NORMAL', 'State reset after resolution', 'SYSTEM', currentTimeMs);
  }

  /**
   * Checks if an action is eligible and marks it as dispatched to avoid duplicate triggers.
   */
  public canDispatchAction(eventId: string): boolean {
    if (this.currentState !== 'EMERGENCY') return false;
    if (this.actionDispatchedMap.get(eventId)) return false; // Already dispatched

    this.actionDispatchedMap.set(eventId, true);
    return true;
  }

  private transitionTo(newState: AlertState, reason: string, nodeId: string, timestamp: number): void {
    const record: StateTransitionRecord = {
      id: `TR_${timestamp}_${Math.random().toString(36).substring(2, 7)}`,
      previousState: this.currentState,
      newState,
      timestamp,
      reason,
      nodeId,
      actionTriggered: newState === 'EMERGENCY'
    };

    this.currentState = newState;
    this.transitionHistory.push(record);
  }

  private getHighestPriorityEvaluation(evals: AlertEvaluationResult[]): AlertEvaluationResult | null {
    if (evals.length === 0) return null;

    const statePriority: Record<AlertState, number> = {
      'EMERGENCY': 6,
      'ESCALATING': 5,
      'WARNING': 4,
      'ACKNOWLEDGED': 3,
      'SUPPRESSED': 2,
      'RESOLVED': 1,
      'NORMAL': 0
    };

    return evals.reduce((highest, curr) => {
      return (statePriority[curr.state] > statePriority[highest.state]) ? curr : highest;
    }, evals[0]);
  }

  public reset(): void {
    this.currentState = 'NORMAL';
    this.activeEmergencyId = null;
    this.actionDispatchedMap.clear();
    this.transitionHistory = [];
  }
}

export const emergencyStateMachine = new EmergencyStateMachine();

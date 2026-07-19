import { AlertPriority, AlertCategory } from '../types/alerts';

/**
 * Pure deterministic prioritization node.
 * Maps health risk layers, verified activity exceptions, and rule vectors 
 * into standard alert dispatch priority metrics.
 */
export const determineAlertPriority = (
  category: AlertCategory,
  riskSeverity: string,
  triggerRules: string[]
): AlertPriority => {
  
  // 1. Map absolute emergency vectors
  if (
    riskSeverity === 'CRITICAL' || 
    triggerRules.includes('CRITICAL_ENVIRONMENTAL_LETHAL_GAS_BREACH') ||
    triggerRules.includes('ENVIRONMENTAL_HYPOXIA_COMPOUND_BREACH') ||
    triggerRules.includes('DETERMINISTIC_FALL_IMPACT_VERIFIED')
  ) {
    return 'EMERGENCY';
  }

  // 2. Map high operational urgency levels
  if (
    riskSeverity === 'HIGH' || 
    triggerRules.includes('TACHYCARDIA_THRESHOLD_EXCEEDED') ||
    triggerRules.includes('SUSTAINED_HAZARDOUS_GAS_EXPOSURE')
  ) {
    return 'HIGH';
  }

  // 3. Map standard structural warning boundaries
  if (riskSeverity === 'MEDIUM' || riskSeverity === 'LOW') {
    return 'WARNING';
  }

  // 4. Baseline fallback state
  if (category === 'SYSTEM' && triggerRules.length > 0) {
    return 'INFO';
  }

  return 'NONE';
};
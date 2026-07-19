import { IHealthRiskEngine, IIntegratedRiskStatus, ISingleRiskAssessment } from '../types/risks';
import { IRiskConfig, DEFAULT_RISK_CONFIG } from '../config/riskConfig';
import { evaluateHeartRisk, evaluateSpO2Risk, evaluateGasRisk } from './singleRiskRules';
import { evaluateCompositeRisks } from './riskConsolidation';
import { RiskPersistenceTracker } from './riskPersistence';
import { buildRiskOutput } from './riskOutputBuilder';

/**
 * Coordination and integration orchestration pipeline for the PR4.4 Health Risk Engine.
 * Combines outputs from PR4.1, PR4.2, and PR4.3 into consolidated deterministic risk matrices.
 */
export class HealthRiskEngine implements IHealthRiskEngine {
  private config: IRiskConfig;
  private persistenceTracker: RiskPersistenceTracker;

  constructor(config: IRiskConfig = DEFAULT_RISK_CONFIG) {
    this.config = config;
    this.persistenceTracker = new RiskPersistenceTracker(config);
  }

  /**
   * Orchestrates multi-sensor data fusion and applies deterministic rule blocks.
   */
  public evaluateHealthRisks(
    telemetryMetrics: { heartRate: number; spo2: number; gas: number },
    activityState: { currentActivity: string; confidence: number },
    trendSummary: { heartRate: { direction: string; deltaValue: number }; spo2: { direction: string; deltaValue: number } },
    currentTimestamp: number = Date.now()
  ): IIntegratedRiskStatus {
    
    // 1. Compute isolated core raw metric sensor assessments
    const heartRisk = evaluateHeartRisk(telemetryMetrics.heartRate, this.config);
    const o2Risk = evaluateSpO2Risk(telemetryMetrics.spo2, this.config);
    const gasRisk = evaluateGasRisk(telemetryMetrics.gas, this.config);

    const initialSingleRisks: ISingleRiskAssessment[] = [];
    if (heartRisk.severity !== 'NONE') initialSingleRisks.push(heartRisk);
    if (o2Risk.severity !== 'NONE') initialSingleRisks.push(o2Risk);
    if (gasRisk.severity !== 'NONE') initialSingleRisks.push(gasRisk);

    // 2. Compute cross-domain complex multi-sensor composite conditions
    const compositeRisks = evaluateCompositeRisks(initialSingleRisks, activityState, trendSummary);

    // 3. Assemble complete structural threat catalog
    const allActiveRisks = [...initialSingleRisks, ...compositeRisks];

    if (allActiveRisks.length === 0) {
      return buildRiskOutput(currentTimestamp, [], false);
    }

    // 4. Pass compiled configurations through transient spike persistence filters
    let continuousSustainedBreach = false;

    for (let i = 0; i < allActiveRisks.length; i++) {
      const risk = allActiveRisks[i];
      const ruleKey = `${risk.category}_${risk.sourceRules.join('_')}`;
      
      const isTransient = this.persistenceTracker.checkTransientSpike(
        ruleKey,
        risk.severity,
        currentTimestamp
      );

      if (!isTransient) {
        continuousSustainedBreach = true;
      }
    }

    // A status is flagged as a transient spike ONLY if NO single active risk has sustained itself past its window bounds
    const isTransientSpike = !continuousSustainedBreach;

    return buildRiskOutput(currentTimestamp, allActiveRisks, isTransientSpike);
  }

  /**
   * Flushes historical tracking buffers to return the tracking states back to baseline.
   */
  public reset(): void {
    this.persistenceTracker.clear();
  }
}
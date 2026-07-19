import { IRawTelemetryFrame, IPipelineState } from './pipelineTypes';
import { TelemetryRepository } from '../../repositories/telemetryRepository';
import {
  TelemetryIntelligenceEngine,
  ActivityRecognitionEngine,
  AlertDecisionEngine,
  RecommendationEngine,
  ExplainableAIEngine,
  SummaryAndReportEngine,
  AIPromptEngine
} from './mockEngines';

export type PipelineListener = (state: IPipelineState) => void;

/**
 * Structural Processing Framework coordinating synchronous pipeline executions.
 * Hardened with decoupled catch configurations and isolated fallbacks.
 */
export class PipelineOrchestrator {
  private static instance: PipelineOrchestrator | null = null;
  private listeners: Set<PipelineListener> = new Set();
  private lastKnownState: IPipelineState | null = null;
  private repositoryUnsubscribe: (() => void) | null = null;

  private constructor() {
    this.initializeRepositoryBinding();
  }

  public static getInstance(): PipelineOrchestrator {
    if (!this.instance) {
      this.instance = new PipelineOrchestrator();
    }
    return this.instance;
  }

  private initializeRepositoryBinding(): void {
    try {
      const repository = TelemetryRepository.getInstance();
      this.repositoryUnsubscribe = repository.subscribeToRawStream((frame) => {
        this.processIncomingFrame(frame);
      });
    } catch (err) {
      console.error('CRITICAL: Failed to bind TelemetryRepository to pipeline instance:', err);
    }
  }

  public subscribe(listener: PipelineListener): () => void {
    this.listeners.add(listener);
    if (this.lastKnownState) {
      listener(this.lastKnownState);
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Primary ingestion entry point for inbound raw hardware telemetry packets.
   * Runs each analytical module inside a safe catch block to ensure high availability.
   */
  public processIncomingFrame(frame: IRawTelemetryFrame | null): void {
    const startTime = performance.now();

    // Fallback Verification Block for null or empty payloads
    if (!frame || typeof frame.heartRate !== 'number' || typeof frame.spo2 !== 'number') {
      console.warn('Pipeline ingestion blocked: Inbound hardware frame was null or malformed.');
      this.triggerPipelineFallback(startTime);
      return;
    }

    try {
      // 1. PR4.1 Telemetry Intelligence Engine Pass
      const healthState = TelemetryIntelligenceEngine.process(frame);

      // 2. PR4.2 Activity Recognition Engine Pass
      const activityState = ActivityRecognitionEngine.classify(frame, healthState);

      // 3. PR4.3 Alert Decision Engine Pass
      const alertState = AlertDecisionEngine.evaluate(healthState, activityState);

      // 4. PR4.4 Recommendation Engine Pass
      const recommendations = RecommendationEngine.generate(alertState, healthState);

      // 5. PR4.5 Explainable AI Pass
      const explainableData = ExplainableAIEngine.rationalize(recommendations);

      // 6. PR4.6 & PR4.7 Daily, Weekly, Monthly Summary Processing
      const dailySummary = SummaryAndReportEngine.computeDailySummary(frame, healthState);
      const weeklySummary = SummaryAndReportEngine.computeWeeklySummary();
      const monthlySummary = SummaryAndReportEngine.computeMonthlySummary();

      // Intermediate validation bundle step
      const intermediateState: Partial<IPipelineState> = {
        healthState,
        activityState,
        alertState,
        recommendations
      };

      // 7. PR4.8 AI Prompt Engine Pass
      const aiPrompt = AIPromptEngine.compile(intermediateState);

      const completeState: IPipelineState = {
        healthState,
        activityState,
        alertState,
        recommendations,
        explainableData,
        dailySummary,
        weeklySummary,
        monthlySummary,
        aiPrompt,
        reportMetadata: {
          pipelineExecutionTimeMs: performance.now() - startTime,
          lastProcessedTimestamp: frame.timestamp
        }
      };

      this.lastKnownState = completeState;
      this.dispatch(completeState);

    } catch (engineError) {
      console.error('Pipeline processing exception caught during execution sweep:', engineError);
      this.triggerPipelineFallback(startTime);
    }
  }

  /**
   * Safe fallback builder to keep downstream UI layouts responsive when an issue occurs.
   */
  private triggerPipelineFallback(startTime: number): void {
    const fallbackState: IPipelineState = {
      healthState: { heartRateStatus: 'UNKNOWN', spo2Status: 'UNKNOWN', gasSafetyStatus: 'UNKNOWN', isSafe: false },
      activityState: { currentActivity: 'UNKNOWN', confidenceScore: 0.0 },
      alertState: { isTriggered: true, criticality: 'MEDIUM', message: 'Pipeline degradation: Safe runtime defaults applied.' },
      recommendations: { primaryActionCode: 'REC_FALLBACK', items: [{ priority: 'HIGH', actionItem: 'Inspect hardware pairing link', rationale: 'Analytics stream error recovery activated.' }] },
      explainableData: { targetRecommendationCode: 'REC_FALLBACK', underlyingDirectives: [], systemLogicJustification: 'Automatic fallback applied due to processing interruption.' },
      dailySummary: { timestamp: Date.now(), averageHeartRate: 0, minimumSpO2: 0, totalActiveMinutes: 0, riskFactorAssessment: 'Unknown Profile' },
      weeklySummary: { intervalId: 'W_UNKNOWN', complianceScore: 0, operationalAnomalyCount: 1, insights: [] },
      monthlySummary: { intervalId: 'M_UNKNOWN', overallWellnessIndex: 0, systemicDriftIdentified: false, recommendationsSummary: 'N/A' },
      aiPrompt: { compiledPayload: 'FALLBACK MATRIX INJECTED: WAITING FOR RECOVERY', generatedAt: Date.now() },
      reportMetadata: {
        pipelineExecutionTimeMs: performance.now() - startTime,
        lastProcessedTimestamp: Date.now()
      }
    };

    this.lastKnownState = fallbackState;
    this.dispatch(fallbackState);
  }

  private dispatch(state: IPipelineState): void {
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        console.error('Downstream data distribution intercept failure:', err);
      }
    });
  }

  public tearDownOrchestrator(): void {
    if (this.repositoryUnsubscribe) {
      this.repositoryUnsubscribe();
      this.repositoryUnsubscribe = null;
    }
    this.listeners.clear();
    this.lastKnownState = null;
  }

  public getLastState(): IPipelineState | null {
    return this.lastKnownState;
  }
}\n
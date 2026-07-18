import { IRawTelemetry, IClassifiedHealthStates } from '../types/health';
import { IEngineConfig, DEFAULT_ENGINE_CONFIG } from '../config/engineConfig';
import { evaluateHeartRules } from '../rules/heartRules';
import { evaluateSpO2Rules } from '../rules/spo2Rules';
import { evaluateGasRules } from '../rules/gasRules';
import { classifyHealthStates } from '../classifiers/healthClassifier';

export class TelemetryIntelligenceEngine {
  private config: IEngineConfig;
  private buffer: IRawTelemetry[] = [];

  constructor(config: IEngineConfig = DEFAULT_ENGINE_CONFIG) {
    this.config = config;
  }

  /**
   * Appends incoming real-time frames, trims the window cache, 
   * and runs evaluation matrices over the active windows.
   */
  public processIncomingTelemetry(data: IRawTelemetry): IClassifiedHealthStates {
    const currentTimestamp = data.timestamp;
    
    // 1. Ingest item into local buffer memory
    this.buffer.push(data);

    // 2. Compute dynamic historical horizons based on config limits
    const maxHorizonMs = Math.max(
      this.config.windows.heartWindowMs,
      this.config.windows.spo2WindowMs,
      this.config.windows.gasWindowMs
    );
    const dynamicCutoff = currentTimestamp - maxHorizonMs;

    // 3. Clear dead data points sitting outside the maximum tracking window
    this.buffer = this.buffer.filter(frame => frame.timestamp >= dynamicCutoff);

    // 4. Generate sensor-specific subsets for accurate processing
    const heartCutoff = currentTimestamp - this.config.windows.heartWindowMs;
    const heartWindow = this.buffer.filter(frame => frame.timestamp >= heartCutoff);

    const spo2Cutoff = currentTimestamp - this.config.windows.spo2WindowMs;
    const spo2Window = this.buffer.filter(frame => frame.timestamp >= spo2Cutoff);

    const gasCutoff = currentTimestamp - this.config.windows.gasWindowMs;
    const gasWindow = this.buffer.filter(frame => frame.timestamp >= gasCutoff);

    // 5. Run evaluation rulesets
    const currentHeartState = evaluateHeartRules(heartWindow, this.config);
    const currentSpO2State = evaluateSpO2Rules(spo2Window, this.config);
    const currentGasState = evaluateGasRules(gasWindow, this.config);

    // 6. Aggregate output states
    return classifyHealthStates(
      currentTimestamp,
      currentHeartState,
      currentSpO2State,
      currentGasState
    );
  }

  /**
   * Resets internal in-memory history cache.
   */
  public clearHistory(): void {
    this.buffer = [];
  }
}\n
import { IRawTelemetry } from '../../types/health';
import { IActivityState, IActivityEngine } from '../types/activity';
import { IActivityConfig, DEFAULT_ACTIVITY_CONFIG } from '../config/activityConfig';
import { extractMotionFeatures } from '../features/motionFeatures';
import { detectPosture } from '../posture/postureDetection';
import { classifyRawActivity } from '../classifiers/activityClassifier';
import { ActivityStabilizer } from './activityStabilizer';

/**
 * Core Activity Recognition Execution Node.
 * Consumes historical telemetry arrays and processes features through the 
 * deterministic classification and stabilization pipelines without UI side-effects.
 */
export class ActivityRecognitionEngine implements IActivityEngine {
  private stabilizer: ActivityStabilizer;
  private config: IActivityConfig;

  constructor(config: IActivityConfig = DEFAULT_ACTIVITY_CONFIG) {
    this.config = config;
    this.stabilizer = new ActivityStabilizer(this.config);
  }

  /**
   * Processes a slice of sliding window telemetry packets to derive a stable activity classification.
   */
  public processActivityWindow(windowData: IRawTelemetry[]): IActivityState {
    if (!windowData || windowData.length === 0) {
      return {
        timestamp: Date.now(),
        currentActivity: 'UNKNOWN',
        confidence: 0.0,
        durationInCurrentActivityMs: 0
      };
    }

    const latestFrame = windowData[windowData.length - 1];
    
    // 1. Feature Extraction Node
    const motionFeatures = extractMotionFeatures(windowData);
    
    // 2. Posture Heuristic Node
    const postureFeatures = detectPosture(motionFeatures, this.config);
    
    // 3. Raw Deterministic Classification Node
    const rawActivity = classifyRawActivity(motionFeatures, postureFeatures, this.config);
    
    // 4. State Stabilization Node
    return this.stabilizer.stabilize(rawActivity, latestFrame.timestamp);
  }

  /**
   * Clears internal state parameters inside downstream stabilizers.
   */
  public reset(): void {
    this.stabilizer.reset();
  }
}
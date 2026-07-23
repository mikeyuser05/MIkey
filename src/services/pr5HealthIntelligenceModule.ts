/**
 * Build 5.8: PR5 System Freeze & Public Interface Gateway
 * Exposes frozen PR5 Personal Health Intelligence capabilities to PR6+
 */

import { IntelligenceOrchestrator } from "./intelligenceOrchestrator";
import { TelemetryPayload, IntelligenceOutputPayload } from "../types/intelligencePipeline";

export class PR5HealthIntelligenceModule {
    private orchestrator: IntelligenceOrchestrator;
    private static isFrozen: boolean = false;

    constructor() {
        this.orchestrator = new IntelligenceOrchestrator();
        PR5HealthIntelligenceModule.isFrozen = true;
    }

    /**
     * Public immutable entrypoint for raw telemetry processing
     */
    public analyzeTelemetry(payload: TelemetryPayload): IntelligenceOutputPayload {
        return this.orchestrator.processTelemetry(payload);
    }

    /**
     * Readiness check for downstream PR6 consumption
     */
    public isModuleReady(): boolean {
        return PR5HealthIntelligenceModule.isFrozen;
    }
}

/**
 * PR8.5: Cost and Rate Guardrails Service
 * Enforces rate limiting, token quotas, and automated cost controls on AI requests.
 */

import { AIModelTier } from "../types/aiContext";

export interface RateGuardrailConfig {
    maxRequestsPerMinute: number;
    maxRequestsPerHour: number;
    dailyTokenBudget: number;
    costPerThousandTokensUSD: {
        DEEP_CLINICAL: number;
        FAST_REASONING: number;
    };
}

export interface UsageMetrics {
    requestsThisMinute: number;
    requestsThisHour: number;
    tokensUsedToday: number;
    estimatedCostTodayUSD: number;
    lastResetTimestamp: number;
}

export class AIGuardrailController {
    private config: RateGuardrailConfig;
    private metrics: UsageMetrics;
    private requestTimestamps: number[] = [];

    constructor(customConfig?: Partial<RateGuardrailConfig>) {
        this.config = {
            maxRequestsPerMinute: 10,
            maxRequestsPerHour: 60,
            dailyTokenBudget: 50000,
            costPerThousandTokensUSD: {
                DEEP_CLINICAL: 0.0015,
                FAST_REASONING: 0.0001
            },
            ...customConfig
        };

        this.metrics = {
            requestsThisMinute: 0,
            requestsThisHour: 0,
            tokensUsedToday: 0,
            estimatedCostTodayUSD: 0.0,
            lastResetTimestamp: Date.now()
        };
    }

    /**
     * Checks whether an incoming request satisfies rate limits and token budgets
     */
    public validateRequestExecution(
        estimatedTokens: number,
        tier: AIModelTier
    ): { allowed: boolean; recommendedTier: AIModelTier; reason?: string } {
        const now = Date.now();
        this.cleanStaleTimestamps(now);

        // 1. Minute Rate Limit
        const recentMinuteRequests = this.requestTimestamps.filter((t) => now - t < 60000).length;
        if (recentMinuteRequests >= this.config.maxRequestsPerMinute) {
            return {
                allowed: false,
                recommendedTier: "FAST_REASONING",
                reason: "Per-minute request rate limit exceeded."
            };
        }

        // 2. Token Budget Enforcement (Downgrade to FAST_REASONING if DEEP_CLINICAL exceeds limit)
        if (this.metrics.tokensUsedToday + estimatedTokens > this.config.dailyTokenBudget) {
            if (tier === "DEEP_CLINICAL") {
                return {
                    allowed: true,
                    recommendedTier: "FAST_REASONING",
                    reason: "Daily token quota exceeded. Downgrading to local FAST_REASONING tier."
                };
            }
            return {
                allowed: false,
                recommendedTier: "FAST_REASONING",
                reason: "Daily token budget strictly depleted."
            };
        }

        return { allowed: true, recommendedTier: tier };
    }

    /**
     * Records token consumption and updates cost tracking
     */
    public recordUsage(tokensUsed: number, tier: AIModelTier): void {
        const now = Date.now();
        this.requestTimestamps.push(now);

        this.metrics.tokensUsedToday += tokensUsed;
        const rate = this.config.costPerThousandTokensUSD[tier];
        this.metrics.estimatedCostTodayUSD += (tokensUsed / 1000) * rate;
    }

    public getMetrics(): UsageMetrics {
        return { ...this.metrics };
    }

    private cleanStaleTimestamps(now: number): void {
        this.requestTimestamps = this.requestTimestamps.filter((t) => now - t < 3600000); // Keep last hour
    }
}

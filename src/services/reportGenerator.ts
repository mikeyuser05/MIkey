/**
 * PR7.6: Report Generation Service
 * Synthesizes historical health data into clinical and personal health report summaries.
 */

import { DailyHealthRecord, HealthReportPayload } from "../types/healthHistory";

export class ReportGeneratorService {
    /**
     * Generates a comprehensive HealthReportPayload from an array of DailyHealthRecords
     */
    public generateReport(
        userId: string,
        dailyRecords: DailyHealthRecord[]
    ): HealthReportPayload {
        if (dailyRecords.length === 0) {
            throw new Error("Cannot generate health report from 0 daily records.");
        }

        const sorted = [...dailyRecords].sort((a, b) => a.dateIso.localeCompare(b.dateIso));
        const count = sorted.length;

        const totalRestingHr = sorted.reduce((sum, r) => sum + r.vitals.restingHeartRate, 0);
        const totalSpO2 = sorted.reduce((sum, r) => sum + r.vitals.spO2.average, 0);
        const totalSteps = sorted.reduce((sum, r) => sum + r.activity.totalSteps, 0);
        const totalAnomalies = sorted.reduce((sum, r) => sum + r.anomalyCount, 0);

        const avgRestingHeartRate = parseFloat((totalRestingHr / count).toFixed(1));
        const avgSpO2 = parseFloat((totalSpO2 / count).toFixed(1));

        // Evaluate Heart Rate Trajectory
        const firstHalf = sorted.slice(0, Math.floor(count / 2));
        const secondHalf = sorted.slice(Math.floor(count / 2));

        const firstHalfAvgHr = firstHalf.reduce((sum, r) => sum + r.vitals.restingHeartRate, 0) / (firstHalf.length || 1);
        const secondHalfAvgHr = secondHalf.reduce((sum, r) => sum + r.vitals.restingHeartRate, 0) / (secondHalf.length || 1);

        let hrTrajectory = "STABLE";
        if (secondHalfAvgHr - firstHalfAvgHr > 3.0) {
            hrTrajectory = "ELEVATING";
        } else if (firstHalfAvgHr - secondHalfAvgHr > 3.0) {
            hrTrajectory = "IMPROVING";
        }

        // Evaluate Activity Trajectory
        const firstHalfSteps = firstHalf.reduce((sum, r) => sum + r.activity.totalSteps, 0) / (firstHalf.length || 1);
        const secondHalfSteps = secondHalf.reduce((sum, r) => sum + r.activity.totalSteps, 0) / (secondHalf.length || 1);

        let activityTrajectory = "MAINTAINED";
        if (secondHalfSteps - firstHalfSteps > 1500) {
            activityTrajectory = "INCREASING";
        } else if (firstHalfSteps - secondHalfSteps > 1500) {
            activityTrajectory = "DECREASING";
        }

        // Build Clinical Notes
        const clinicalNotes: string[] = [];
        clinicalNotes.push(`Average resting heart rate observed at ${avgRestingHeartRate} BPM over ${count} evaluated day(s).`);
        clinicalNotes.push(`Mean peripheral oxygen saturation (SpO2) maintained at ${avgSpO2}%.`);

        if (totalAnomalies > 0) {
            clinicalNotes.push(`A total of ${totalAnomalies} statistical anomaly alert(s) were flagged during this period.`);
        } else {
            clinicalNotes.push("Zero physiological anomalies were detected within the target window.");
        }

        if (hrTrajectory === "ELEVATING") {
            clinicalNotes.push("Noticeable upward trend in resting heart rate detected; monitor for fatigue or stress factors.");
        } else if (hrTrajectory === "IMPROVING") {
            clinicalNotes.push("Positive downward trend in resting heart rate indicates improving cardiovascular recovery efficiency.");
        }

        const reportId = `RPT_${userId}_${Date.now()}`;

        return {
            reportId,
            userId,
            generatedAt: Date.now(),
            timeframe: {
                startDateIso: sorted[0].dateIso,
                endDateIso: sorted[sorted.length - 1].dateIso
            },
            summary: {
                avgRestingHeartRate,
                avgSpO2,
                totalSteps,
                totalAnomalies
            },
            trends: {
                heartRateTrajectory: hrTrajectory,
                activityTrajectory
            },
            clinicalNotes
        };
    }
}

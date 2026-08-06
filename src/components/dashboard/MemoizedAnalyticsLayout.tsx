import React, { useMemo } from 'react';
import { useHeartRateChart } from '../../hooks/useHeartRateChart';
import { useSpO2Chart } from '../../hooks/useSpO2Chart';
import { useGasChart } from '../../hooks/useGasChart';
import { useStepsChart } from '../../hooks/useStepsChart';
import { LineChart } from '../../charts/LineChart';
import { AreaChart } from '../../charts/AreaChart';
import { GaugeChart } from '../../charts/GaugeChart';
import { ErrorBoundary } from '../shared/ErrorBoundary';
// Add this import line:
import { ReportsPanel } from '../analytics/ReportsPanel';

const MemoizedLineChart = React.memo(LineChart);
const MemoizedAreaChart = React.memo(AreaChart);
const MemoizedGaugeChart = React.memo(GaugeChart);

export const MemoizedAnalyticsLayout: React.FC = () => {
  const hrStream = useHeartRateChart('1m');
  const spO2Stream = useSpO2Chart('1m');
  const gasStream = useGasChart('1m');
  const stepsStream = useStepsChart('1m');

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 focus:outline-none" tabIndex={0} aria-label="Real-time Analytics Core Matrix">
        <ErrorBoundary>
          <MemoizedLineChart data={hrStream.data} metricType="HeartRate" title="Heart Rate Analytics" subtitle={`Avg: ${hrStream.stats.average} BPM`} unit="BPM" isLoading={hrStream.isLoading} />
        </ErrorBoundary>
        <ErrorBoundary>
          <MemoizedAreaChart data={spO2Stream.data} metricType="SpO2" title="Pulse Oximetry Stream" subtitle={`Trend: ${spO2Stream.stats.trend}`} unit="%" isLoading={spO2Stream.isLoading} />
        </ErrorBoundary>
        <ErrorBoundary>
          <MemoizedGaugeChart value={gasStream.stats.currentValue} metricType="Gas" title="Gas Concentration" subtitle={`Samples: ${gasStream.stats.sampleCount}`} unit="PPM" isLoading={gasStream.isLoading} />
        </ErrorBoundary>
        <ErrorBoundary>
          <MemoizedLineChart data={stepsStream.data} metricType="Steps" title="Pedometer Intercepts" subtitle={`Total: ${stepsStream.stats.currentValue}`} unit="steps" isLoading={stepsStream.isLoading} />
        </ErrorBoundary>
      </div>

      {/* Reports Panel Placement */}
      <div className="mt-6 w-full">
        <ReportsPanel />
      </div>
    </>
  );
};

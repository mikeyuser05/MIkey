import { useGlobalState } from '@context/GlobalContext';

export interface IUseLiveVitalsResult {
  heartRate: number;
  spO2: number;         // Fixed to match chart key name
  gas: number;          // Fixed to match chart key name
  steps: number;
  isLoading: boolean;
  error: string | null;
}

export const useLiveVitals = (): IUseLiveVitalsResult => {
  const context = useGlobalState();
  
  // Safe extraction matching the interface layer
  const pipelineData = context?.pipelineData;
  const isLoading = context?.isLoading ?? false;
  const error = context?.error ?? null;

  const heartRate = pipelineData?.dailySummary?.averageHeartRate ?? 0;
  const spO2 = pipelineData?.dailySummary?.minimumSpO2 ?? 0;
  const gas = pipelineData?.healthState?.gasSafetyStatus === 'SAFE' ? 120 : 450;
  const steps = pipelineData?.dailySummary?.totalActiveMinutes ? pipelineData.dailySummary.totalActiveMinutes * 90 : 0;

  return {
    heartRate,
    spO2,
    gas,
    steps,
    isLoading,
    error,
  };
};
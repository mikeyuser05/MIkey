import { ReactElement } from 'react';
import { HeartPulse } from 'lucide-react';
import { VitalCard } from './VitalCard';
import { useGlobalContext } from '@hooks/useGlobalContext';
import { useHeartRateTelemetry } from '../../hooks/useHeartRateTelemetry';

export function HeartRateCard(): ReactElement {
  const { telemetryConnected } = useGlobalContext();
  const { currentHR, rawHR, isFilteredMode, setIsFilteredMode } = useHeartRateTelemetry();

  return (
    <div className="relative group">
      {/* Vital Card displaying Filtered/Raw BPM */}
      <VitalCard
        icon={<HeartPulse className="h-5 w-5" strokeWidth={2.25} />}
        label="Heart Rate"
        value={currentHR ? currentHR.toString() : '--'}
        unit="BPM"
        status={telemetryConnected ? 'normal' : 'offline'}
        trend={isFilteredMode ? 'Filtered' : 'Raw'}
        helperText={
          telemetryConnected
            ? isFilteredMode 
              ? 'Clean Signal Active' 
              : `Raw Stream: ${rawHR} BPM`
            : 'Waiting for device...'
        }
        accentColorClass="text-vital-heartRate"
        accentBgClass="bg-vital-heartRate/10"
      />

      {/* HR Display Mode Switch Toggle */}
      <div className="mt-2 flex items-center justify-between px-2 py-1 bg-slate-900/80 border border-slate-800 rounded-lg text-xs">
        <span className="text-gray-400 font-medium">HR Mode:</span>
        <div className="flex space-x-1">
          <button
            onClick={() => setIsFilteredMode(true)}
            className={`px-2 py-0.5 rounded transition ${
              isFilteredMode 
                ? 'bg-blue-600 text-white font-semibold' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ● Clean
          </button>
          <button
            onClick={() => setIsFilteredMode(false)}
            className={`px-2 py-0.5 rounded transition ${
              !isFilteredMode 
                ? 'bg-amber-600 text-white font-semibold' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ○ Raw
          </button>
        </div>
      </div>
    </div>
  );
}
/**
 * NOEXCUSE HPO V2 - PR14 Hardware Simulator & Virtual Test Laboratory UI
 */

import React, { useState, useEffect } from 'react';
import { hardwareSimulatorEngine } from '../services/hardwareSimulatorEngine';
import { SensorFaultType, SyntheticWaveframe } from '../types/pr14Simulator';

export const PR14HardwareLab: React.FC = () => {
  const [config, setConfig] = useState(hardwareSimulatorEngine.getConfig());
  const [latestFrame, setLatestFrame] = useState<SyntheticWaveframe | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const frame = hardwareSimulatorEngine.generateWaveframe();
      setLatestFrame(frame);
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const handleFaultChange = (fault: SensorFaultType) => {
    hardwareSimulatorEngine.setFault(fault);
    setConfig(hardwareSimulatorEngine.getConfig());
  };

  const handleSliderChange = (key: keyof typeof config, value: number) => {
    hardwareSimulatorEngine.updateConfig({ [key]: value });
    setConfig(hardwareSimulatorEngine.getConfig());
  };

  return (
    <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '24px' }}>
      <header style={{ marginBottom: '20px', borderBottom: '2px solid #cbd5e1', paddingBottom: '12px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>
          PR14 — Hardware Sensor Simulator & Test Laboratory
        </h2>
        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
          Inject physical sensor faults, adjust biometric baselines, and monitor real-time synthetic waveframes.
        </p>
      </header>

      {/* Fault Injector Panel */}
      <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 'bold', color: '#1e293b' }}>
          Hardware Fault Injection Controls
        </h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {(['NONE', 'MAX30100_DISCONNECT', 'MQ9_HEATER_FAULT', 'BMI270_ACCEL_FREEZE', 'GPS_LOCK_LOST', 'BATTERY_CRITICAL_DROP', 'HIGH_PACKET_LOSS'] as SensorFaultType[]).map(fault => (
            <button
              key={fault}
              onClick={() => handleFaultChange(fault)}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: config.activeFault === fault ? '#ef4444' : '#e2e8f0',
                color: config.activeFault === fault ? '#ffffff' : '#334155',
                fontWeight: '600',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              {fault.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Sensor Signal Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>
            Base Heart Rate: {config.baseHeartRate} BPM
          </label>
          <input type="range" min="40" max="200" value={config.baseHeartRate} onChange={e => handleSliderChange('baseHeartRate', Number(e.target.value))} style={{ width: '100%' }} />

          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginTop: '12px', marginBottom: '4px' }}>
            Base SpO2: {config.baseSpO2}%
          </label>
          <input type="range" min="70" max="100" value={config.baseSpO2} onChange={e => handleSliderChange('baseSpO2', Number(e.target.value))} style={{ width: '100%' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>
            Base Gas Level: {config.baseGasPpm} PPM
          </label>
          <input type="range" min="50" max="800" value={config.baseGasPpm} onChange={e => handleSliderChange('baseGasPpm', Number(e.target.value))} style={{ width: '100%' }} />

          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginTop: '12px', marginBottom: '4px' }}>
            Motion Artifact Intensity: {config.motionIntensity}
          </label>
          <input type="range" min="0" max="1" step="0.05" value={config.motionIntensity} onChange={e => handleSliderChange('motionIntensity', Number(e.target.value))} style={{ width: '100%' }} />
        </div>
      </div>

      {/* Live Waveframe Monitor */}
      {latestFrame && (
        <div style={{ padding: '16px', backgroundColor: '#0f172a', borderRadius: '8px', color: '#38bdf8', fontFamily: 'monospace', fontSize: '13px' }}>
          <div style={{ color: '#94a3b8', marginBottom: '8px', fontWeight: 'bold' }}>LIVE SYNTHETIC SIGNAL STREAM</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
            <div>PPG Wave: <span style={{ color: '#ffffff' }}>{latestFrame.ppgValue}</span></div>
            <div>Gas Analog: <span style={{ color: '#ffffff' }}>{latestFrame.gasAnalogRaw}</span></div>
            <div>Accel Z: <span style={{ color: '#ffffff' }}>{latestFrame.accelZ} m/s²</span></div>
            <div>Battery: <span style={{ color: latestFrame.batteryPercent < 15 ? '#ef4444' : '#22c55e' }}>{latestFrame.batteryPercent}%</span></div>
          </div>
        </div>
      )}
    </div>
  );
};

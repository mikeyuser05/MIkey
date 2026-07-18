# append_testing.py
import os

def build_testing_layer():
    base_dir = os.path.join("src", "telemetry", "__tests__")
    os.makedirs(base_dir, exist_ok=True)
    
    test_code = """// src/telemetry/__tests__/telemetryPipeline.test.ts
import { validateTelemetryPacket, sanitizeTelemetryPacket } from '../utils/validation';
import { telemetryReducer, initialState } from '../context/telemetryReducer';
import { RawTelemetryPacket, TelemetrySnapshot } from '../types';

describe('PR3.11.4: Telemetry Service Validation & Sanitization Boundaries', () => {
  const validPacket: RawTelemetryPacket = {
    ts: 1718000000000,
    hr: 75,
    spo2: 98,
    temp: 36.654,
    ax: 0.12345,
    ay: -0.54321,
    az: 9.81,
    batt: 85.5,
    rssi: -65
  };

  it('should cleanly validate structured, high-fidelity data packets within physical boundaries', () => {
    expect(validateTelemetryPacket(validPacket)).toBe(true);
  });

  it('should immediately reject corrupted heart rate values out of bounds (> 300)', () => {
    const corruptPacket = { ...validPacket, hr: 315 };
    expect(validateTelemetryPacket(corruptPacket)).toBe(false);
  });

  it('should immediately reject corrupted blood oxygen levels (> 100)', () => {
    const corruptPacket = { ...validPacket, spo2: 105 };
    expect(validateTelemetryPacket(corruptPacket)).toBe(false);
  });

  it('should format values to exact floating point constraints and mathematical ranges during sanitization', () => {
    const dirtyPacket = { ...validPacket, temp: 36.6666, batt: 85.9 };
    const clean = sanitizeTelemetryPacket(dirtyPacket);
    
    expect(clean.temp).toBe(36.67);
    expect(clean.batt).toBe(85); // Math.floor rule enforcement
  });
});

describe('PR3.11.5: Telemetry Reducer State Machine Transitions', () => {
  it('should append device snapshot data immutably without drops', () => {
    const mockSnapshot: TelemetrySnapshot = {
      deviceId: 'DEVICE_001',
      lastUpdated: 1718000005000,
      metrics: { ts: 1718000000000, hr: 80, spo2: 99, temp: 36.5, ax: 0, ay: 0, az: 1, batt: 90, rssi: -50 }
    };

    const action = { type: 'UPDATE_DEVICE_SNAPSHOT' as const, payload: mockSnapshot };
    const nextState = telemetryReducer(initialState, action);

    expect(nextState.devices['DEVICE_001']).toBeDefined();
    expect(nextState.devices['DEVICE_001']?.metrics.hr).toBe(80);
    expect(Object.keys(nextState.devices).length).toBe(1);
  });

  it('should smoothly adjust network connection states without losing existing device cache tables', () => {
    const complexState = {
      ...initialState,
      devices: {
        'DEV_NODE': {
          deviceId: 'DEV_NODE',
          lastUpdated: 12345,
          metrics: { ts: 1234, hr: 60, spo2: 95, temp: 37, ax: 0, ay: 0, az: 0, batt: 50, rssi: -80 }
        }
      }
    };

    const action = { type: 'SET_CONNECTION_STATUS' as const, payload: 'OFFLINE' as const };
    const nextState = telemetryReducer(complexState, action);

    expect(nextState.connectionStatus).toBe('OFFLINE');
    expect(nextState.devices['DEV_NODE']).toBeDefined(); // Cache integrity check preserved
  });
});
"""
    with open(os.path.join(base_dir, "telemetryPipeline.test.ts"), "w", encoding="utf-8") as f:
        f.write(test_code)
    print("[NOEXCUSE HPO V2] Production validation and pipeline tests generated successfully.")

if __name__ == "__main__":
    build_testing_layer()
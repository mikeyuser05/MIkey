// src/telemetry/utils/validation.ts
import { RawTelemetryPacket } from '../types';

/**
 * Validates incoming physical packets against reasonable electrical and physical parameters.
 * Prevents corrupted data packets from reaching downstream components.
 */
export function validateTelemetryPacket(packet: RawTelemetryPacket): boolean {
  if (!packet || typeof packet !== 'object') return false;
  
  // Verify standard numeric boundaries (non-empty fields, within hardware operational constraints)
  if (isNaN(packet.ts) || packet.ts <= 0) return false;
  if (isNaN(packet.hr) || packet.hr < 0 || packet.hr > 300) return false;
  if (isNaN(packet.spo2) || packet.spo2 < 0 || packet.spo2 > 100) return false;
  if (isNaN(packet.temp) || packet.temp < 0 || packet.temp > 60) return false;
  if (isNaN(packet.batt) || packet.batt < 0 || packet.batt > 100) return false;

  return true;
}

/**
 * Ensures fields maintain data safety and structure consistency
 */
export function sanitizeTelemetryPacket(packet: RawTelemetryPacket): RawTelemetryPacket {
  return {
    ts: Math.floor(packet.ts),
    hr: Math.max(0, Math.min(300, packet.hr)),
    spo2: Math.max(0, Math.min(100, packet.spo2)),
    temp: Number(packet.temp.toFixed(2)),
    ax: Number(packet.ax.toFixed(4)),
    ay: Number(packet.ay.toFixed(4)),
    az: Number(packet.az.toFixed(4)),
    batt: Math.max(0, Math.min(100, Math.floor(packet.batt))),
    rssi: Math.floor(packet.rssi)
  };
}

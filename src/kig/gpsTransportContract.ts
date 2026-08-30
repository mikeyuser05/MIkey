/**
 * NOEXCUSE HPO V2
 * PR39.2 — GPS TRANSPORT CONTRACT
 *
 * This contract defines the minimum GPS payload expected to travel through:
 *
 * NEO-6M
 *   ↓
 * PR1 ESP32
 *   ↓
 * Existing ESP-NOW packet
 *   ↓
 * PR2 ESP32
 *   ↓
 * Existing Firebase telemetry
 *   ↓
 * HPO V2
 *   ↓
 * KIG V2B
 *
 * This file does NOT define hardware pins, ESP-NOW binary layout,
 * or Firebase paths.
 *
 * Those must be derived from the actual existing firmware architecture.
 */


/**
 * GPS data produced by PR1 hardware acquisition.
 *
 * Coordinate values are null when a valid GPS fix is unavailable.
 *
 * A no-fix state must never fabricate coordinates.
 */
export interface GPSHardwarePayload {
  latitude: number | null;
  longitude: number | null;

  /**
   * GPS speed as supplied by the hardware.
   *
   * Unit conversion must be performed consistently at the firmware
   * integration boundary once the existing project convention is known.
   */
  speed: number | null;

  /**
   * True only when the GPS module reports a usable position fix.
   */
  hasFix: boolean;

  /**
   * Timestamp in Unix milliseconds when available.
   *
   * Null is permitted at the hardware boundary because timestamp generation
   * may depend on the existing PR1/PR2 architecture.
   */
  timestamp: number | null;
}


/**
 * GPS transport capability contract.
 *
 * PR1 implementation requirements:
 *
 * 1. Read NEO-6M through the existing ESP32 firmware architecture.
 * 2. Preserve BMI270 operation.
 * 3. Preserve MAX30100 operation.
 * 4. Preserve existing ESP-NOW transmission.
 * 5. Extend the existing telemetry packet with GPS fields.
 *
 * PR2 implementation requirements:
 *
 * 1. Receive the extended existing packet.
 * 2. Preserve MQ-9.
 * 3. Preserve OLED.
 * 4. Preserve WiFi.
 * 5. Preserve Firebase telemetry.
 * 6. Forward GPS using the existing telemetry structure.
 */
export interface GPSTransportContract {
  gps: GPSHardwarePayload;
}


/**
 * Required GPS field names at the conceptual transport boundary.
 *
 * The actual firmware field names may differ if the existing packet naming
 * convention requires it.
 *
 * This constant is documentation/support metadata only.
 */
export const GPS_TRANSPORT_FIELDS = [
  "latitude",
  "longitude",
  "speed",
  "hasFix",
  "timestamp",
] as const;


/**
 * Type guard for GPS transport payloads received from an unknown boundary.
 *
 * Structural validation is intentionally lightweight here.
 * Full geographic validation remains the responsibility of gpsValidator.
 */
export function isGPSHardwarePayload(
  value: unknown,
): value is GPSHardwarePayload {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.hasFix === "boolean" &&
    (
      candidate.latitude === null ||
      typeof candidate.latitude === "number"
    ) &&
    (
      candidate.longitude === null ||
      typeof candidate.longitude === "number"
    ) &&
    (
      candidate.speed === null ||
      typeof candidate.speed === "number"
    ) &&
    (
      candidate.timestamp === null ||
      typeof candidate.timestamp === "number"
    )
  );
}

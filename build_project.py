from pathlib import Path


# =============================================================================
# NOEXCUSE HPO V2
# PR39.1 — PART 2
# GPS VALIDATION TEST FOUNDATION
#
# Creates only the test file required for the KIG V2B GPS contract.
#
# Does NOT modify:
# - existing telemetry
# - Firebase
# - dashboard
# - React components
# - PR1 firmware
# - PR2 firmware
# - package.json
# =============================================================================


ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
TEST_DIR = SRC / "kig"

FILES_CREATED = []
FILES_SKIPPED = []


def write_new_file(path: Path, content: str) -> None:
    """Create a file only if it does not already exist."""
    if path.exists():
        FILES_SKIPPED.append(path.relative_to(ROOT))
        return

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.strip() + "\n", encoding="utf-8")
    FILES_CREATED.append(path.relative_to(ROOT))


# =============================================================================
# src/kig/gpsValidator.test.ts
# =============================================================================

GPS_VALIDATOR_TEST_TS = r'''
import {
  isStaleTimestamp,
  isValidLatitude,
  isValidLongitude,
  isValidSpeed,
  isValidTimestamp,
  validateGPS,
} from "./gpsValidator";

import type { RawGPSTelemetry } from "./types";


const NOW = 1_700_000_000_000;


function createRawGPS(
  overrides: Partial<RawGPSTelemetry> = {},
): RawGPSTelemetry {
  return {
    latitude: 12.9716,
    longitude: 77.5946,
    speed: 5.5,
    timestamp: NOW,
    hasFix: true,
    ...overrides,
  };
}


describe("KIG V2B GPS validation", () => {
  describe("coordinate validation", () => {
    it("accepts a valid latitude", () => {
      expect(isValidLatitude(12.9716)).toBe(true);
    });

    it("accepts latitude boundary -90", () => {
      expect(isValidLatitude(-90)).toBe(true);
    });

    it("accepts latitude boundary 90", () => {
      expect(isValidLatitude(90)).toBe(true);
    });

    it("rejects latitude below -90", () => {
      expect(isValidLatitude(-90.0001)).toBe(false);
    });

    it("rejects latitude above 90", () => {
      expect(isValidLatitude(90.0001)).toBe(false);
    });

    it("rejects NaN latitude", () => {
      expect(isValidLatitude(Number.NaN)).toBe(false);
    });

    it("rejects infinite latitude", () => {
      expect(isValidLatitude(Infinity)).toBe(false);
    });

    it("accepts a valid longitude", () => {
      expect(isValidLongitude(77.5946)).toBe(true);
    });

    it("accepts longitude boundary -180", () => {
      expect(isValidLongitude(-180)).toBe(true);
    });

    it("accepts longitude boundary 180", () => {
      expect(isValidLongitude(180)).toBe(true);
    });

    it("rejects longitude below -180", () => {
      expect(isValidLongitude(-180.0001)).toBe(false);
    });

    it("rejects longitude above 180", () => {
      expect(isValidLongitude(180.0001)).toBe(false);
    });
  });


  describe("speed validation", () => {
    it("accepts null speed", () => {
      expect(isValidSpeed(null)).toBe(true);
    });

    it("accepts zero speed", () => {
      expect(isValidSpeed(0)).toBe(true);
    });

    it("accepts positive speed", () => {
      expect(isValidSpeed(12.5)).toBe(true);
    });

    it("rejects negative speed", () => {
      expect(isValidSpeed(-1)).toBe(false);
    });

    it("rejects NaN speed", () => {
      expect(isValidSpeed(Number.NaN)).toBe(false);
    });
  });


  describe("timestamp validation", () => {
    it("accepts a valid timestamp", () => {
      expect(isValidTimestamp(NOW)).toBe(true);
    });

    it("rejects zero timestamp", () => {
      expect(isValidTimestamp(0)).toBe(false);
    });

    it("rejects negative timestamp", () => {
      expect(isValidTimestamp(-100)).toBe(false);
    });

    it("rejects NaN timestamp", () => {
      expect(isValidTimestamp(Number.NaN)).toBe(false);
    });

    it("detects stale timestamps", () => {
      expect(
        isStaleTimestamp(
          NOW - 30_001,
          NOW,
          30_000,
        ),
      ).toBe(true);
    });

    it("accepts fresh timestamps", () => {
      expect(
        isStaleTimestamp(
          NOW - 29_999,
          NOW,
          30_000,
        ),
      ).toBe(false);
    });
  });


  describe("GPS telemetry validation", () => {
    it("accepts valid GPS telemetry", () => {
      const result = validateGPS(
        createRawGPS(),
        undefined,
        NOW,
      );

      expect(result.status).toBe("GPS_VALID");
      expect(result.point).not.toBeNull();
      expect(result.point?.latitude).toBe(12.9716);
      expect(result.point?.longitude).toBe(77.5946);
    });

    it("returns GPS_NO_FIX when no fix exists", () => {
      const result = validateGPS(
        createRawGPS({
          hasFix: false,
          latitude: null,
          longitude: null,
        }),
        undefined,
        NOW,
      );

      expect(result.status).toBe("GPS_NO_FIX");
      expect(result.point).toBeNull();
    });

    it("rejects invalid latitude", () => {
      const result = validateGPS(
        createRawGPS({
          latitude: 100,
        }),
        undefined,
        NOW,
      );

      expect(result.status).toBe("GPS_INVALID");
      expect(result.point).toBeNull();
    });

    it("rejects invalid longitude", () => {
      const result = validateGPS(
        createRawGPS({
          longitude: 200,
        }),
        undefined,
        NOW,
      );

      expect(result.status).toBe("GPS_INVALID");
      expect(result.point).toBeNull();
    });

    it("rejects missing coordinates with a claimed GPS fix", () => {
      const result = validateGPS(
        createRawGPS({
          latitude: null,
          longitude: null,
          hasFix: true,
        }),
        undefined,
        NOW,
      );

      expect(result.status).toBe("GPS_INVALID");
      expect(result.point).toBeNull();
    });

    it("rejects invalid speed", () => {
      const result = validateGPS(
        createRawGPS({
          speed: -1,
        }),
        undefined,
        NOW,
      );

      expect(result.status).toBe("GPS_INVALID");
      expect(result.point).toBeNull();
    });

    it("rejects invalid timestamp", () => {
      const result = validateGPS(
        createRawGPS({
          timestamp: null,
        }),
        undefined,
        NOW,
      );

      expect(result.status).toBe("GPS_INVALID");
      expect(result.point).toBeNull();
    });

    it("returns GPS_STALE for old GPS telemetry", () => {
      const result = validateGPS(
        createRawGPS({
          timestamp: NOW - 30_001,
        }),
        undefined,
        NOW,
      );

      expect(result.status).toBe("GPS_STALE");
      expect(result.point).toBeNull();
    });
  });
});
'''


# =============================================================================
# BUILD
# =============================================================================

def main() -> None:
    print("=" * 72)
    print("NOEXCUSE HPO V2")
    print("PR39.1 — PART 2")
    print("GPS VALIDATION TEST FOUNDATION")
    print("=" * 72)
    print()

    if not SRC.exists():
        raise RuntimeError(
            f"Expected source directory was not found: {SRC}"
        )

    required_files = [
        TEST_DIR / "types.ts",
        TEST_DIR / "gpsValidator.ts",
        TEST_DIR / "kigEngine.ts",
        TEST_DIR / "index.ts",
    ]

    missing = [
        path.relative_to(ROOT)
        for path in required_files
        if not path.exists()
    ]

    if missing:
        print("ERROR: PR39.1 PART 1 FOUNDATION IS MISSING")
        print()

        for path in missing:
            print(f"  - {path}")

        print()
        print("Run PART 1 successfully before running PART 2.")
        raise SystemExit(1)

    write_new_file(
        TEST_DIR / "gpsValidator.test.ts",
        GPS_VALIDATOR_TEST_TS,
    )

    print("CREATED FILES")
    print("-" * 72)

    if FILES_CREATED:
        for file_path in FILES_CREATED:
            print(f"  + {file_path}")
    else:
        print("  None")

    print()
    print("EXISTING FILES PRESERVED")
    print("-" * 72)

    if FILES_SKIPPED:
        for file_path in FILES_SKIPPED:
            print(f"  = {file_path}")
    else:
        print("  None")

    print()
    print("PART 2 COMPLETE")
    print("GPS validation test foundation created.")
    print()


if __name__ == "__main__":
    main()
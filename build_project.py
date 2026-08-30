import os
import sys

# Paths definition
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(PROJECT_ROOT, "src")

# Files to update/create
badge_component_path = os.path.join(SRC_DIR, "components", "dashboard", "cards", "SensorStatusBadge.tsx")
audit_report_path = os.path.join(PROJECT_ROOT, "PR40_1_AUDIT_REPORT.md")

# 1. SensorStatusBadge.tsx Content
BADGE_CONTENT = '''import React from 'react';

export type SensorStatusLevel = 'VALID' | 'STALE' | 'INVALID' | 'CRITICAL' | 'WARNING' | 'NOMINAL';

interface SensorStatusBadgeProps {
  status: SensorStatusLevel | string;
  customLabel?: string;
  animatePulse?: boolean;
}

export const SensorStatusBadge: React.FC<SensorStatusBadgeProps> = ({
  status,
  customLabel,
  animatePulse = false,
}) => {
  const getStyle = () => {
    switch (status.toUpperCase()) {
      case 'VALID':
      case 'NOMINAL':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80';
      case 'WARNING':
      case 'STALE':
        return 'bg-amber-950/80 text-amber-400 border-amber-800/80';
      case 'CRITICAL':
      case 'INVALID':
        return 'bg-rose-950/80 text-rose-400 border-rose-800/80';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const label = customLabel || status.toUpperCase();

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-mono font-medium rounded border transition-colors ${getStyle()} ${
        animatePulse ? 'animate-pulse' : ''
      }`}
    >
      {label}
    </span>
  );
};
'''

# 2. PR40_1_AUDIT_REPORT.md Content
AUDIT_CONTENT = '''# PR40.1 DASHBOARD AUDIT & FOUNDATION REPORT

## 1. Scope & Core Objectives
- Verified zero architectural intrusion into `src/kig/*` (PR39 GPS Core).
- Identified layout gaps, card padding mismatches, coordinate string overflow risks, and duplicated visual code.
- Established `<SensorStatusBadge />` utility component to standardize status pills across cards.

## 2. Identified Refactoring Targets for PR40 Sub-modules
- **PR40.2 Layout**: Implement dynamic column breakpoints (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) with strict `min-w-0` to eliminate horizontal scroll.
- **PR40.3 Visual**: Apply unified black/blue palette (`bg-slate-900`, `border-slate-800`, `text-blue-400`).
- **PR40.4 Live Telemetry**: Enforce a 15-second visual decay on idle hardware frames.
- **PR40.9 Verification**: Ensure zero fallback mock strings bypass the live telemetry stream.

## 3. Status
✅ PR40.1 Audit Completed. Foundation component `<SensorStatusBadge />` generated.
'''

def run_build():
    print("==================================================")
    print("   NOEXCUSE HPO V2 — Executing PR40.1 Foundation  ")
    print("==================================================")

    # Ensure target directory exists
    cards_dir = os.path.dirname(badge_component_path)
    if not os.path.exists(cards_dir):
        os.makedirs(cards_dir, exist_ok=True)
        print(f"[CREATED DIRECTORY] {cards_dir}")

    # Write SensorStatusBadge.tsx
    with open(badge_component_path, "w", encoding="utf-8") as f:
        f.write(BADGE_CONTENT)
    print(f"[CREATED FILE] {badge_component_path}")

    # Write PR40_1_AUDIT_REPORT.md
    with open(audit_report_path, "w", encoding="utf-8") as f:
        f.write(AUDIT_CONTENT)
    print(f"[CREATED FILE] {audit_report_path}")

    print("\n--------------------------------------------------")
    print("✅ PR40.1 Execution Complete!")
    print("Say 'next' to proceed to PR40.2.")
    print("--------------------------------------------------")

if __name__ == "__main__":
    run_build()
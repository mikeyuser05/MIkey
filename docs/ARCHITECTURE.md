# HPO V2 - Health Monitoring & Telemetry Architecture

## System Topography
The HPO V2 system is a multi-node biometric monitoring platform designed for real-time telemetry streaming, offline storage synchronization, and predictive fault triage.

[ ESP32 Nodes / Simulator ] ---> (ESP-NOW / WebSockets) ---> [ Node Hub / Gateway ]
                                                                     |
                                                               (Firebase / REST)
                                                                     v
                                                            [ Vite / React Dashboard ]

## Key Modules
1. Telemetry & Sensor Array (PR14 / PR1):
   - MAX30100: PPG Waveform, Heart Rate (BPM), SpO2 (%).
   - MQ-9: Combustible Gas / Carbon Monoxide analog levels (PPM).
   - BMI270: Accelerometer & Gyroscope (Motion Artifact Correction).
2. Offline Sync Queue (PR16):
   - Serializes telemetry payloads into IndexedDB / LocalStorage during network drops.
   - Automatically flushes queued frames upon connection recovery.
3. Multi-Node Command Center (PR15):
   - Real-time fleet management for node health, battery monitoring, and GPS tracking.
4. Triage & Alert Engine (PR11 / PR5):
   - Priority escalation engine assessing biometric anomalies and gas thresholds.

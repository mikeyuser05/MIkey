# HPO V2 - API & Telemetry Reference

## Telemetry Payload Schema

POST /api/v1/telemetry
Incoming payload from sensor nodes:

{
  "nodeId": "PR1-NODE-01",
  "timestamp": 1785532800000,
  "vitals": {
    "hr": 78,
    "spo2": 98,
    "gasPpm": 120,
    "accelZ": 9.81
  },
  "battery": 88
}

## Alert Thresholds

| Metric | Normal Range | Critical Threshold | Action |
| :--- | :--- | :--- | :--- |
| Heart Rate | 60 - 100 BPM | < 40 or > 180 BPM | High Priority Triage Alert |
| SpO2 | 95% - 100% | < 90% | Immediate Oxygen Warning |
| MQ-9 Gas | < 200 PPM | > 400 PPM | Critical Fault / Gas Evacuation Alert |
| Battery | 20% - 100% | < 15% | Critical Battery Drop Flag |

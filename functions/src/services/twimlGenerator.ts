import { TelemetryDetails } from '../types/voice';

export class TwiMLGenerator {
  public static generateEmergencySpeech(
    eventId: string, 
    reason: string, 
    telemetry?: TelemetryDetails
  ): string {
    const node = telemetry?.nodeId || 'UNKNOWN_NODE';
    const hr = telemetry?.heartRate ? `${telemetry.heartRate} beats per minute` : 'Unavailable';
    const spo2 = telemetry?.spo2 ? `${telemetry.spo2} percent` : 'Unavailable';
    const gas = telemetry?.gasLevelPpm ? `${telemetry.gasLevelPpm} parts per million` : 'Normal';

    const speechMessage = `
<Response>
  <Say voice="Polly.Amy-Neural" language="en-US">
    This is an automated critical health alert from HPO V2 Health Monitoring System.
    A validated critical health event has been detected on device node ${node}.
    Current vital parameters:
    Heart Rate: ${hr}.
    Oxygen Saturation: ${spo2}.
    Toxic Gas Level: ${gas}.
    Event Reason: ${reason}.
    Please check the monitored individual and dispatch emergency response immediately.
  </Say>
  <Pause length="2"/>
  <Say voice="Polly.Amy-Neural" language="en-US">
    Repeating emergency alert. Monitored node ${node} requires immediate assistance.
  </Say>
</Response>
    `.trim();

    return speechMessage;
  }
}

/**
 * NOEXCUSE HPO V2 - Extended Emergency Voice Dispatcher with Location (PR12)
 * Embeds geo-location pins & zone context into primary emergency dispatches.
 */

import { AlertEvaluationResult, EmergencyContact } from '../types/pr11Triage';
import { GPSTelemetry } from '../types/pr12Geo';
import { geoService } from './geoService';

export interface ExtendedDispatchPayload {
  id: string;
  timestamp: number;
  recipientName: string;
  recipientPhone: string;
  messageText: string;
  audioScript: string;
  coordinates: string;
  mapsUrl: string;
  zone: string;
  isRestrictedZone: boolean;
}

export class SimulatedVoiceDispatcherPR12 {
  public generateGeoDispatch(
    alert: AlertEvaluationResult,
    contact: EmergencyContact,
    gps: GPSTelemetry,
    siteNodeLabel: string = 'Primary Gateway',
    currentTime: number = Date.now()
  ): ExtendedDispatchPayload {
    const geo = geoService.generateGeoDispatchPayload(gps, currentTime);

    const messageText = `EMERGENCY ALERT for Node ${alert.nodeId} (${siteNodeLabel}). ` +
      `Condition: ${alert.category} - ${alert.reason}. ` +
      `Location: ${geo.zoneName} (${geo.formattedCoordinates}). ` +
      `Map Pin: ${geo.googleMapsUrl} ` +
      `${geo.isRestrictedArea ? '[RESTRICTED AREA WARNING] ' : ''}` +
      `${geo.accuracyWarning ? '[GPS ACCURACY DEGRADED]' : ''}`;

    const audioScript = `Emergency notification for ${contact.name}. ` +
      `Subject device ${alert.nodeId} triggered a ${alert.severity} priority alert. ` +
      `Primary reason: ${alert.reason}. ` +
      `Subject is located at ${geo.zoneName}. ` +
      `Coordinates: ${geo.formattedCoordinates}. ` +
      `Please review the operational dashboard or respond immediately.`;

    return {
      id: `DISPATCH_GEO_${currentTime}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: currentTime,
      recipientName: contact.name,
      recipientPhone: contact.phone,
      messageText,
      audioScript,
      coordinates: geo.formattedCoordinates,
      mapsUrl: geo.googleMapsUrl,
      zone: geo.zoneName,
      isRestrictedZone: geo.isRestrictedArea
    };
  }
}

export const simulatedVoiceDispatcherPR12 = new SimulatedVoiceDispatcherPR12();

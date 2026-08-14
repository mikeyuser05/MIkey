import { NormalizedCallStatus } from '../types/voice';

export class CallStatusNormalizer {
  public static normalizeTwilioStatus(rawStatus: string): NormalizedCallStatus {
    const statusMap: Record<string, NormalizedCallStatus> = {
      'queued': 'queued',
      'initiated': 'queued',
      'ringing': 'ringing',
      'in-progress': 'in-progress',
      'completed': 'completed',
      'busy': 'busy',
      'failed': 'failed',
      'no-answer': 'no-answer',
      'canceled': 'failed',
    };

    const normalized = statusMap[rawStatus.toLowerCase()];
    return normalized || 'failed';
  }
}

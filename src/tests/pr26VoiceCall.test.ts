import { TwiMLGenerator } from '../../functions/src/services/twimlGenerator';
import { CallStatusNormalizer } from '../../functions/src/services/callStatusNormalizer';

describe('PR26 — Automated Voice Message & Status Normalization Tests', () => {
  test('Generates TwiML voice XML with telemetry details', () => {
    const twiml = TwiMLGenerator.generateEmergencySpeech(
      'evt_crit_101',
      'CRITICAL_GAS_EXPOSURE',
      {
        nodeId: 'NODE_ESP32_01',
        heartRate: 135,
        spo2: 88,
        gasLevelPpm: 1200,
      }
    );

    expect(twiml).toContain('<Response>');
    expect(twiml).toContain('NODE_ESP32_01');
    expect(twiml).toContain('135 beats per minute');
    expect(twiml).toContain('88 percent');
    expect(twiml).toContain('1200 parts per million');
    expect(twiml).toContain('CRITICAL_GAS_EXPOSURE');
  });

  test('Normalizes Twilio call statuses accurately', () => {
    expect(CallStatusNormalizer.normalizeTwilioStatus('initiated')).toBe('queued');
    expect(CallStatusNormalizer.normalizeTwilioStatus('ringing')).toBe('ringing');
    expect(CallStatusNormalizer.normalizeTwilioStatus('in-progress')).toBe('in-progress');
    expect(CallStatusNormalizer.normalizeTwilioStatus('completed')).toBe('completed');
    expect(CallStatusNormalizer.normalizeTwilioStatus('busy')).toBe('busy');
    expect(CallStatusNormalizer.normalizeTwilioStatus('no-answer')).toBe('no-answer');
    expect(CallStatusNormalizer.normalizeTwilioStatus('canceled')).toBe('failed');
  });
});

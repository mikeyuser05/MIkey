import { EmergencyCallBackendService } from '../../functions/src/services/emergencyCallService';
import { CallRequestPayload } from '../../functions/src/types/voice';

describe('PR25 — Secure Emergency Voice Backend Server Validation', () => {
  let backendService: EmergencyCallBackendService;

  beforeEach(() => {
    backendService = new EmergencyCallBackendService();
    process.env.ENABLE_REAL_CALLS = 'false'; // Enforce safe mock mode
  });

  test('Processes valid CRITICAL request in mock test mode', async () => {
    const payload: CallRequestPayload = {
      requestId: `req_valid_${Date.now()}`,
      eventId: 'evt_crit_01',
      targetPhone: '+15550199',
      severity: 'CRITICAL',
      reasonCode: 'ALL_SAFETY_CONDITIONS_PASSED',
      timestamp: Date.now(),
    };

    const response = await backendService.processCallRequest(payload);
    expect(response.success).toBe(true);
    expect(response.provider).toBe('MOCK');
    expect(response.callSid).toContain('MOCK_CALL_');
  });

  test('Rejects request if severity is not CRITICAL', async () => {
    const payload: any = {
      requestId: `req_mod_${Date.now()}`,
      eventId: 'evt_mod_01',
      targetPhone: '+15550199',
      severity: 'MODERATE',
      reasonCode: 'SEVERITY_NOT_CRITICAL',
      timestamp: Date.now(),
    };

    const response = await backendService.processCallRequest(payload);
    expect(response.success).toBe(false);
    expect(response.message).toContain('REJECTED: Non-CRITICAL severity level');
  });

  test('Rejects non-E.164 phone numbers', async () => {
    const payload: CallRequestPayload = {
      requestId: `req_bad_phone_${Date.now()}`,
      eventId: 'evt_crit_02',
      targetPhone: '555-0199', // Invalid format
      severity: 'CRITICAL',
      reasonCode: 'ALL_SAFETY_CONDITIONS_PASSED',
      timestamp: Date.now(),
    };

    const response = await backendService.processCallRequest(payload);
    expect(response.success).toBe(false);
    expect(response.message).toContain('E.164 format');
  });

  test('Blocks duplicate request IDs', async () => {
    const dupId = `req_dup_${Date.now()}`;
    const payload: CallRequestPayload = {
      requestId: dupId,
      eventId: 'evt_crit_03',
      targetPhone: '+15550188',
      severity: 'CRITICAL',
      reasonCode: 'ALL_SAFETY_CONDITIONS_PASSED',
      timestamp: Date.now(),
    };

    const firstResult = await backendService.processCallRequest(payload);
    expect(firstResult.success).toBe(true);

    const secondResult = await backendService.processCallRequest(payload);
    expect(secondResult.success).toBe(false);
    expect(secondResult.message).toContain('Duplicate call request ID');
  });
});

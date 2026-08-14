import VoiceResponse from 'twilio/lib/twiml/VoiceResponse';

export const generateTwimlResponse = (data?: any): string => {
  const response = new VoiceResponse();
  response.say(
    { voice: 'alice' },
    'Emergency alert triggered. Dispatching immediate responder team to your current location.'
  );
  return response.toString();
};

export class TwiMLGenerator {
  public static generate(data?: any): string {
    return generateTwimlResponse(data);
  }

  public static generateEmergencySpeech(eventId?: string, reason?: string, telemetry?: any): string {
    const response = new VoiceResponse();
    const reasonText = reason ? `Reason code: ${reason}.` : 'Critical system threshold exceeded.';
    const eventText = eventId ? `Event ID reference: ${eventId}.` : '';

    response.say(
      { voice: 'alice' },
      `Emergency alert triggered. ${reasonText} ${eventText} Immediate responder team is being dispatched.`
    );

    return response.toString();
  }
}
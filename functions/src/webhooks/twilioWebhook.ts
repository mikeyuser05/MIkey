import VoiceResponse from 'twilio/lib/twiml/VoiceResponse';

export function generateTwimlResponse(body?: any): string {
  const response = new VoiceResponse();

  // Custom emergency speech prompt
  response.say(
    {
      voice: 'alice',
      language: 'en-US',
      loop: 2, // Repeats twice so the caller hears it clearly
    },
    'Patient is in emergency. Look at the messages. Patient is in emergency.'
  );

  return response.toString();
}
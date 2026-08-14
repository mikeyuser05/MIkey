import { generateTwimlResponse } from '../services/twimlGenerator';

export const twilioCallWebhook = (body: any): string => {
  return generateTwimlResponse(body);
};

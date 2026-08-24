export interface Envelope<T = any> {
  eventId: string;
  eventType: string;
  occurredAt: string;
  correlationId: string;
  data: T;
}

export const EVENT_TYPES: { [key: string]: string };
export function buildEnvelope(eventType: string, data: any, correlationId?: string): Envelope;

import { randomUUID } from 'node:crypto';
export const EVENT_TYPES = {
    AUTH_LOGIN: 'auth.login',
    ORDER_CREATED: 'order.created',
    PAYMENT_AUTHORIZED: 'payment.authorized',
    WALLET_UPDATED: 'wallet.updated',
    NOTIFICATION_SENT: 'notification.sent'
};
export function buildEnvelope(eventType, data, correlationId = randomUUID()) {
    return {
        eventId: randomUUID(),
        eventType,
        occurredAt: new Date().toISOString(),
        correlationId,
        data
    };
}

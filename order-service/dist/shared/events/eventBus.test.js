import test from 'node:test';
import assert from 'node:assert/strict';
import { eventBus } from './eventBus.js';
test('publishes envelopes to subscribers', () => {
    let received;
    const unsubscribe = eventBus.subscribe('auth.login', (envelope) => {
        received = envelope;
    });
    const envelope = eventBus.publish('auth.login', { userId: 'user-1' });
    assert.ok(envelope.eventId);
    assert.equal(envelope.eventType, 'auth.login');
    assert.equal(received.eventType, 'auth.login');
    unsubscribe();
});

import express from 'express';
import { buildEnvelope, EVENT_TYPES } from '../shared/events/event-contract.js';

const app = express();
app.use(express.json());

function respond(res, payload, status = 200) {
  res.status(status).json(payload);
}

app.get('/health', (req, res) => {
  respond(res, { status: 'ok', service: 'notification-service' });
});

app.post('/notifications', (req, res) => {
  const { userId = 'user-001', message = 'Order update' } = req.body;
  const event = buildEnvelope(EVENT_TYPES.NOTIFICATION_SENT, { userId, message });
  console.log('[notification-service] emitted event', event.eventType);
  respond(res, { success: true, message, event });
});

app.get('/notifications/:userId', (req, res) => {
  respond(res, { service: 'notification-service', userId: req.params.userId, notifications: [] });
});

app.post('/notifications/email', (req, res) => {
  respond(res, { service: 'notification-service', endpoint: '/notifications/email', payload: req.body });
});

app.post('/notifications/push', (req, res) => {
  respond(res, { service: 'notification-service', endpoint: '/notifications/push', payload: req.body });
});

app.post('/notifications/sms', (req, res) => {
  respond(res, { service: 'notification-service', endpoint: '/notifications/sms', payload: req.body });
});

app.use((req, res) => {
  respond(res, { error: 'Route not found', service: 'notification-service' }, 404);
});

const port = process.env.PORT || 3003;
app.listen(port, () => {
  console.log(`[notification-service] listening on port ${port}`);
});

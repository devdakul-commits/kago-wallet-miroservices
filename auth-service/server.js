import express from 'express';
import { buildEnvelope, EVENT_TYPES } from '../shared/events/event-contract.js';

const app = express();
app.use(express.json());

function respond(res, payload, status = 200) {
  res.status(status).json(payload);
}

app.get('/health', (req, res) => {
  respond(res, { status: 'ok', service: 'auth-service' });
});

app.post('/auth/login', (req, res) => {
  const { userId = 'user-001', email = 'user@example.com' } = req.body;
  const token = `mock-token-${userId}`;
  const event = buildEnvelope(EVENT_TYPES.AUTH_LOGIN, { userId, email, token });

  console.log('[auth-service] emitted event', event.eventType);
  respond(res, { success: true, token, userId, event });
});

app.get('/weather', (req, res) => {
  respond(res, { service: 'auth-service', endpoint: '/weather', data: { condition: 'Clear', temperature: 28, humidity: 60 } });
});

app.get('/user/profile/:firebase_uid', (req, res) => {
  respond(res, { service: 'auth-service', endpoint: '/user/profile', userId: req.params.firebase_uid, profile: { fullName: 'Kago User', email: 'user@example.com' } });
});

app.put('/user/profile/:firebase_uid', (req, res) => {
  respond(res, { service: 'auth-service', endpoint: '/user/profile', action: 'updated', userId: req.params.firebase_uid, payload: req.body });
});

app.post('/user/profile/:firebase_uid/photo', (req, res) => {
  respond(res, { service: 'auth-service', endpoint: '/user/profile/photo', action: 'uploaded', userId: req.params.firebase_uid });
});

app.post('/user/profile/:firebase_uid/cac', (req, res) => {
  respond(res, { service: 'auth-service', endpoint: '/user/profile/cac', action: 'uploaded', userId: req.params.firebase_uid });
});

app.post('/user/profile/:firebase_uid/valid-id', (req, res) => {
  respond(res, { service: 'auth-service', endpoint: '/user/profile/valid-id', action: 'uploaded', userId: req.params.firebase_uid });
});

app.post('/user/profile/:firebase_uid/business-image', (req, res) => {
  respond(res, { service: 'auth-service', endpoint: '/user/profile/business-image', action: 'uploaded', userId: req.params.firebase_uid });
});

app.get('/user/settings/:firebase_uid/notifications', (req, res) => {
  respond(res, { service: 'auth-service', endpoint: '/user/settings/notifications', userId: req.params.firebase_uid, notifications: { email: true, sms: false } });
});

app.put('/user/settings/:firebase_uid/notifications', (req, res) => {
  respond(res, { service: 'auth-service', endpoint: '/user/settings/notifications', action: 'updated', userId: req.params.firebase_uid, payload: req.body });
});

app.get('/user/settings/:firebase_uid/reward', (req, res) => {
  respond(res, { service: 'auth-service', endpoint: '/user/settings/reward', userId: req.params.firebase_uid, reward: { enabled: true } });
});

app.put('/user/settings/:firebase_uid/reward', (req, res) => {
  respond(res, { service: 'auth-service', endpoint: '/user/settings/reward', action: 'updated', userId: req.params.firebase_uid, payload: req.body });
});

app.get('/user/settings/:firebase_uid/referrals', (req, res) => {
  respond(res, { service: 'auth-service', endpoint: '/user/settings/referrals', userId: req.params.firebase_uid, referrals: [] });
});

app.get('/user/settings/:firebase_uid/referrals/balance', (req, res) => {
  respond(res, { service: 'auth-service', endpoint: '/user/settings/referrals/balance', userId: req.params.firebase_uid, balance: 0 });
});

app.post('/user/settings/:firebase_uid/referrals/redeem', (req, res) => {
  respond(res, { service: 'auth-service', endpoint: '/user/settings/referrals/redeem', action: 'redeemed', userId: req.params.firebase_uid, payload: req.body });
});

app.get('/user/settings/:firebase_uid/suggestion', (req, res) => {
  respond(res, { service: 'auth-service', endpoint: '/user/settings/suggestion', userId: req.params.firebase_uid, suggestion: { enabled: true } });
});

app.put('/user/settings/:firebase_uid/suggestion', (req, res) => {
  respond(res, { service: 'auth-service', endpoint: '/user/settings/suggestion', action: 'updated', userId: req.params.firebase_uid, payload: req.body });
});

app.get('/user/suggestions/:firebase_uid', (req, res) => {
  respond(res, { service: 'auth-service', endpoint: '/user/suggestions', userId: req.params.firebase_uid, suggestions: [] });
});

app.post('/user/suggestions/:firebase_uid', (req, res) => {
  respond(res, { service: 'auth-service', endpoint: '/user/suggestions', action: 'created', userId: req.params.firebase_uid, payload: req.body });
});

app.get('/user/settings/:firebase_uid/safety', (req, res) => {
  respond(res, { service: 'auth-service', endpoint: '/user/settings/safety', userId: req.params.firebase_uid, safety: { emergencyContact: true } });
});

app.put('/user/settings/:firebase_uid/safety', (req, res) => {
  respond(res, { service: 'auth-service', endpoint: '/user/settings/safety', action: 'updated', userId: req.params.firebase_uid, payload: req.body });
});

app.get('/user/support/:firebase_uid/messages', (req, res) => {
  respond(res, { service: 'auth-service', endpoint: '/user/support/messages', userId: req.params.firebase_uid, messages: [] });
});

app.post('/user/support/:firebase_uid/messages', (req, res) => {
  respond(res, { service: 'auth-service', endpoint: '/user/support/messages', action: 'sent', userId: req.params.firebase_uid, payload: req.body });
});

app.post('/user/support/:firebase_uid/report', (req, res) => {
  respond(res, { service: 'auth-service', endpoint: '/user/support/report', action: 'reported', userId: req.params.firebase_uid, payload: req.body });
});

app.get('/user/support/:firebase_uid/reports', (req, res) => {
  respond(res, { service: 'auth-service', endpoint: '/user/support/reports', userId: req.params.firebase_uid, reports: [] });
});

app.get('/user/reward/daily/status/:firebase_uid', (req, res) => {
  respond(res, { service: 'auth-service', endpoint: '/user/reward/daily/status', userId: req.params.firebase_uid, status: { checkedIn: false, streak: 0 } });
});

app.post('/user/reward/daily/checkin/:firebase_uid', (req, res) => {
  respond(res, { service: 'auth-service', endpoint: '/user/reward/daily/checkin', action: 'checked-in', userId: req.params.firebase_uid });
});

app.get('/user/reward/daily/history/:firebase_uid', (req, res) => {
  respond(res, { service: 'auth-service', endpoint: '/user/reward/daily/history', userId: req.params.firebase_uid, history: [] });
});

app.get('/user/reward/health', (req, res) => {
  respond(res, { service: 'auth-service', endpoint: '/user/reward/health', status: 'ok' });
});

app.use((req, res) => {
  respond(res, { error: 'Route not found', service: 'auth-service' }, 404);
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`[auth-service] listening on port ${port}`);
});

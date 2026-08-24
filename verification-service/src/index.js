import express from 'express';
import jwt from 'jsonwebtoken';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';
const REDIS_URL = process.env.REDIS_URL ?? 'redis://127.0.0.1:6379';
const redis = new Redis(REDIS_URL);

// Use Redis set for blacklist
const BLACKLIST_SET = 'auth:blacklist_tokens';

// Subscribe to invalidate messages
const sub = new Redis(REDIS_URL);
sub.subscribe('auth:token_invalidate', (err) => {
  if (err) console.error('subscribe error', err);
});
sub.on('message', async (_channel, message) => {
  try {
    const payload = JSON.parse(message);
    const token = payload.token;
    if (!token) return;
    // extract expiry from token and set TTL accordingly
    const decoded = jwt.decode(token, { complete: true });
    let ttlSec = 60 * 60; // default 1h
    if (decoded && decoded.payload && decoded.payload.exp) {
      const exp = decoded.payload.exp; // seconds since epoch
      const now = Math.floor(Date.now() / 1000);
      ttlSec = Math.max(0, exp - now);
    }
    if (ttlSec > 0) {
      await redis.setex(`${BLACKLIST_SET}:${token}`, ttlSec, '1');
    } else {
      await redis.set(`${BLACKLIST_SET}:${token}`, '1');
    }
    console.log('[verification-service] blacklisted token', token.slice(0,8));
  } catch (e) {
    console.error('message handler error', e);
  }
});

app.post('/verify', async (req, res) => {
  const auth = String(req.header('Authorization') ?? '');
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : req.body.token;
  if (!token) return res.status(400).json({ error: 'token required' });

  try {
    // Check blacklist
    const isBlacklisted = await redis.get(`${BLACKLIST_SET}:${token}`);
    if (isBlacklisted) return res.status(401).json({ valid: false, reason: 'token_revoked' });

    const payload = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, payload });
  } catch (err) {
    res.status(401).json({ valid: false, error: String(err) });
  }
});

// Provide an admin invalidate endpoint
app.post('/invalidate', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'token required' });
  // publish into the same channel so subscribers handle TTL consistently
  await redis.publish('auth:token_invalidate', JSON.stringify({ token }));
  res.json({ success: true });
});

const port = process.env.PORT ?? 4002;
app.listen(port, () => console.log(`[verification-service] listening on ${port}`));

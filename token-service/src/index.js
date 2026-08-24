import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';
const REDIS_URL = process.env.REDIS_URL ?? 'redis://127.0.0.1:6379';
const redis = new Redis(REDIS_URL);

app.post('/issue', async (req, res) => {
  const { firebaseUid, role, expiresIn = '1h' } = req.body;
  if (!firebaseUid) return res.status(400).json({ error: 'firebaseUid required' });
  const token = jwt.sign({ firebaseUid, role }, JWT_SECRET, { expiresIn });

  // create a refresh token and store in Redis with TTL
  const refreshToken = jwt.sign({ firebaseUid, type: 'refresh' }, JWT_SECRET, { expiresIn: '7d' });
  try {
    // store refresh token keyed by session id (or firebase uid)
    await redis.setex(`refresh:${refreshToken}`, 7 * 24 * 3600, firebaseUid);
  } catch (e) {
    console.error('redis setex error', e);
  }

  // publish issuance event
  try {
    await redis.publish('auth:token_issued', JSON.stringify({ firebaseUid, token }));
  } catch (e) {
    console.error('publish error', e);
  }

  res.json({ token, refreshToken });
});

// Exchange refresh token for new access token
app.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' });
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    // ensure refresh exists in redis
    const uid = await redis.get(`refresh:${refreshToken}`);
    if (!uid) return res.status(401).json({ error: 'refresh_invalid' });

    const payload = typeof decoded === 'object' ? decoded : {};
    const firebaseUid = payload.firebaseUid || uid;
    const newToken = jwt.sign({ firebaseUid }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token: newToken });
  } catch (e) {
    res.status(401).json({ error: 'invalid_refresh', detail: String(e) });
  }
});

app.post('/hash', async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'password required' });
  const hash = await bcrypt.hash(password, 10);
  res.json({ hash });
});

app.post('/invalidate', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'token required' });
  try {
    // publish invalidate event, verification service will add to blacklist
    await redis.publish('auth:token_invalidate', JSON.stringify({ token }));
    // also remove refresh token if present
    await redis.del(`refresh:${token}`);
    res.json({ success: true });
  } catch (e) {
    console.error('invalidate publish error', e);
    res.status(500).json({ error: 'failed to publish' });
  }
});

const port = process.env.PORT ?? 4001;
app.listen(port, () => console.log(`[token-service] listening on ${port}`));

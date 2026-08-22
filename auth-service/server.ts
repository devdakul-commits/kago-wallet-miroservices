import express from 'express';
import { registerRoutes } from './src/routes/index.js';

const app = express();
app.use(express.json());
registerRoutes(app);

app.use((req, res) => res.status(404).json({ error: 'Route not found', service: 'auth-service' }));

const walletUrl = process.env.WALLET_SERVICE_URL;
const walletSecret = process.env.WALLET_SERVICE_SECRET;
if (!walletUrl) {
  console.error('[auth-service] WALLET_SERVICE_URL is required');
  process.exit(1);
}
if (!walletSecret) {
  console.error('[auth-service] WALLET_SERVICE_SECRET is required');
  process.exit(1);
}

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`[auth-service] listening on port ${port}`));

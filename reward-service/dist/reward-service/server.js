import express from 'express';
import { registerRewardRoutes } from './src/routes/rewardRoutes.js';
import { eventBus, EVENT_TYPES } from '../shared/events/eventBus.js';
const app = express();
app.use(express.json());
registerRewardRoutes(app);
eventBus.subscribe(EVENT_TYPES.AUTH_LOGIN, (envelope) => {
    console.log('[reward-service] auth.login event received for', envelope.data);
});
app.use((req, res) => res.status(404).json({ error: 'Route not found', service: 'reward-service' }));
const port = process.env.PORT || 3015;
app.listen(port, () => console.log(`[reward-service] listening on port ${port}`));

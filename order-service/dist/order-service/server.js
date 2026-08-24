import express from 'express';
import { registerOrderRoutes } from './src/routes/orderRoutes.js';
import { eventBus, EVENT_TYPES } from '../shared/events/eventBus.js';
const app = express();
app.use(express.json());
registerOrderRoutes(app);
eventBus.subscribe(EVENT_TYPES.AUTH_LOGIN, (envelope) => {
    console.log('[order-service] auth.login event received for', envelope.data);
});
app.use((req, res) => res.status(404).json({ error: 'Route not found', service: 'order-service' }));
const port = process.env.PORT || 3002;
app.listen(port, () => console.log(`[order-service] listening on port ${port}`));

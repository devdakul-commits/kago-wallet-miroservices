import express from 'express';
import { registerRideRoutes } from './src/routes/rideRoutes.js';
import { eventBus, EVENT_TYPES } from '../shared/events/eventBus.js';
const app = express();
app.use(express.json());
registerRideRoutes(app);
eventBus.subscribe(EVENT_TYPES.AUTH_LOGIN, (envelope) => {
    console.log('[ride-service] auth.login event received for', envelope.data);
});
app.use((req, res) => res.status(404).json({ error: 'Route not found', service: 'ride-service' }));
const port = process.env.PORT || 3016;
app.listen(port, () => console.log(`[ride-service] listening on port ${port}`));

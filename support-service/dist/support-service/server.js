import express from 'express';
import { registerSupportRoutes } from './src/routes/supportRoutes.js';
const app = express();
app.use(express.json());
registerSupportRoutes(app);
app.use((req, res) => res.status(404).json({ error: 'Route not found', service: 'support-service' }));
const port = process.env.PORT || 3020;
app.listen(port, () => console.log(`[support-service] listening on port ${port}`));

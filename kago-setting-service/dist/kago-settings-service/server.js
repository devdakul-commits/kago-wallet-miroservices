import express from 'express';
import { registerSettingsRoutes } from './src/routes/settingsRoutes.js';
const app = express();
app.use(express.json());
registerSettingsRoutes(app);
app.use((req, res) => res.status(404).json({ error: 'Route not found', service: 'settings-service' }));
const port = process.env.PORT || 3017;
app.listen(port, () => console.log(`[settings-service] listening on port ${port}`));

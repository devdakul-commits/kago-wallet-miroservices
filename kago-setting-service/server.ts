import express from 'express';
import { registerRoutes } from './src/routes/index.js';

const app = express();
app.use(express.json());
registerRoutes(app);

app.use((req, res) => res.status(404).json({ error: 'Route not found', service: 'settings-service' }));

const port = process.env.PORT || 3017;
app.listen(port, () => console.log(`[settings-service] listening on port ${port}`));

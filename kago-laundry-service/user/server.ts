import express from 'express';
import { registerRoutes } from './src/routes/index.js';

const app = express();
app.use(express.json());
registerRoutes(app as any);

app.use((req, res) => res.status(404).json({ error: 'Route not found', service: 'kago-laundry-service-user' }));

const port = process.env.PORT || 3012;
app.listen(port, () => console.log(`[kago-laundry-service-user] listening on port ${port}`));

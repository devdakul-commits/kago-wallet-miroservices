import express from 'express';
import { registerChatRoutes } from './src/routes/chatRoutes.js';
const app = express();
app.use(express.json());
registerChatRoutes(app);
app.use((req, res) => res.status(404).json({ error: 'Route not found', service: 'chat-service' }));
const port = process.env.PORT || 3010;
app.listen(port, () => console.log(`[chat-service] listening on port ${port}`));

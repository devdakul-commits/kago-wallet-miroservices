import express from 'express';
import { registerRoutes } from './src/routes/index.js';
import { NotificationService } from './src/services/notificationService.js';
import { eventBus, EVENT_TYPES } from './shared/events/eventBus.js';

const app = express();
app.use(express.json());
registerRoutes(app);

const notificationService = new NotificationService();
eventBus.subscribe(EVENT_TYPES.ORDER_CREATED, (envelope) => {
  const data = envelope.data as Record<string, unknown>;
  const userId = String(data.userId ?? 'user-001');
  const orderId = String(data.orderId ?? 'unknown-order');
  const amount = Number(data.amount ?? 0);
  const orderType = String(data.orderType ?? 'order');

  notificationService.send(userId, `Your ${orderType} order ${orderId} was created. Amount ₦${amount.toFixed(2)} deducted.`, 'push');
  console.log('[notification-service] handled order.created event for', userId);
});

app.use((req, res) => res.status(404).json({ error: 'Route not found', service: 'notification-service' }));

const port = process.env.PORT || 3003;
app.listen(port, () => console.log(`[notification-service] listening on port ${port}`));

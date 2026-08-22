import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController.js';

export function registerNotificationRoutes(app: Router) {
  const controller = new NotificationController();

  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'notification-service' }));
  app.post('/notifications', controller.send);
  app.get('/notifications/:userId', controller.list);
  app.post('/notifications/email', controller.send);
  app.post('/notifications/push', controller.send);
  app.post('/notifications/sms', controller.send);
}

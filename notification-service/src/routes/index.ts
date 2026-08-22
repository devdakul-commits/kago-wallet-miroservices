import { Router } from 'express';
import { registerNotificationRoutes } from './notificationRoutes.js';

export function registerRoutes(app: Router) {
  registerNotificationRoutes(app);
}

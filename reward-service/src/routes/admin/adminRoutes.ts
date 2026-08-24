import { Router } from 'express';
import { AdminController } from '../../controllers/admin/adminController.js';

export function registerRewardAdminRoutes(app: Router) {
  const controller = new AdminController();
  app.get('/admin/health', controller.getHealth);
}

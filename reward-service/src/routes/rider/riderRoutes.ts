import { Router } from 'express';
import { RiderController } from '../../controllers/rider/riderController.js';

export function registerRewardRiderRoutes(app: Router) {
  const controller = new RiderController();
  app.get('/rider/health', controller.getHealth);
}

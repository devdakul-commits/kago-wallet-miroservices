import { Router } from 'express';
import { ReferralAdminController } from '../controllers/referralAdminController.js';

export function registerReferralAdminRoutes(app: Router) {
  const controller = new ReferralAdminController();
  app.post('/admin/referrals/clean', controller.cleanReferralCodes);
}

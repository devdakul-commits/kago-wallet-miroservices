import { Router } from 'express';
import { registerRewardUserRoutes } from './user/rewardRoutes.js';
import { registerRewardAdminRoutes } from './admin/adminRoutes.js';
import { registerRewardRiderRoutes } from './rider/riderRoutes.js';

export function registerRewardRoutes(app: Router) {
  registerRewardUserRoutes(app);
  registerRewardAdminRoutes(app);
  registerRewardRiderRoutes(app);
}

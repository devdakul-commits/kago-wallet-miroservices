import { Router } from 'express';
import { registerRewardRoutes } from './rewardRoutes.js';

export function registerRoutes(app: Router) {
  registerRewardRoutes(app);
}

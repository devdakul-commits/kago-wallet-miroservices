import { Router } from 'express';
import { registerRideUserRoutes } from './user/rideRoutes.js';

export function registerRideRoutes(app: Router) {
  registerRideUserRoutes(app);
}

import { Router } from 'express';
import { registerRideRoutes } from './rideRoutes.js';

export function registerRoutes(app: Router) {
  registerRideRoutes(app);
}

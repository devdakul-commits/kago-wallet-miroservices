import { Router } from 'express';
import { registerLaundryRoutes } from './laundryRoutes.js';

export function registerRoutes(app: Router) {
  registerLaundryRoutes(app);
}

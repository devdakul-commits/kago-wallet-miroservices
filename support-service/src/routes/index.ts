import { Router } from 'express';
import { registerSupportRoutes } from './supportRoutes.js';

export function registerRoutes(app: Router) {
  registerSupportRoutes(app);
}

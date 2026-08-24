import { Router } from 'express';
import { registerOrderRoutes } from './orderRoutes.js';

export function registerRoutes(app: Router) {
  registerOrderRoutes(app);
}

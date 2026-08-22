import { Router } from 'express';
import { registerInventoryRoutes } from './inventoryRoutes.js';

export function registerRoutes(app: Router) {
  registerInventoryRoutes(app);
}

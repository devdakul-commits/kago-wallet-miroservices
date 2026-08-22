import { Router } from 'express';
import { registerMenuRoutes } from './menuRoutes.js';

export function registerRoutes(app: Router) {
  registerMenuRoutes(app);
}

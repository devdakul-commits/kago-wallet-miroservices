import { Router } from 'express';
import { registerSettingsUserRoutes } from './user/settingsRoutes.js';

export function registerSettingsRoutes(app: Router) {
  registerSettingsUserRoutes(app);
}

import { Router } from 'express';
import { registerChatRoutes } from './chatRoutes.js';
import { registerVendorChatRoutes } from './vendorChatRoutes.js';

export function registerRoutes(app: Router) {
  registerChatRoutes(app);
  registerVendorChatRoutes(app);
}

import { Router } from 'express';
import { registerProfileRoutes } from './profileRoutes.js';
import { registerVendorRoutes } from './vendorRoutes.js';
import { registerVendorAdminRoutes } from '../../admin/routes/vendorAdminRoutes.js';

export function registerRoutes(app: Router) {
  registerProfileRoutes(app);
  registerVendorRoutes(app);
  registerVendorAdminRoutes(app);
}

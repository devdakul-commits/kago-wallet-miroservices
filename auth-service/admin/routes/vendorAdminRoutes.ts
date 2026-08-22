import { Router } from 'express';
import { VendorAdminController } from '../controllers/vendorAdminController.js';

export function registerVendorAdminRoutes(app: Router) {
  const controller = new VendorAdminController();
  app.post('/admin/vendors/approve', controller.approveVendor);
  app.get('/admin/vendors', controller.listVendors);

  // Legacy compatibility routes for admin portal
  app.post('/vendor/approve', controller.approveVendor);
  app.get('/vendor/list', controller.listVendors);
}

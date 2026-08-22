import { Router } from 'express';
import { InventoryController } from '../controllers/inventoryController.js';

export function registerInventoryRoutes(app: Router) {
  const controller = new InventoryController();

  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'inventory-service' }));
  app.post('/inventory/items', controller.addItem);
  app.get('/inventory/vendors/:vendor_uid/items', controller.listItems);
  app.get('/inventory/items/:item_id', controller.getItem);
  app.post('/inventory/reservations', controller.reserveItem);
  app.get('/inventory/orders/:order_id/reservations', controller.getReservations);
  app.get('/inventory/orders/:order_id/reservations/status', controller.getReservationStatus);
}

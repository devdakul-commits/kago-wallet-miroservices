import { Router } from 'express';
import { OrderController } from '../controllers/orderController.js';

export function registerOrderRoutes(app: Router) {
  const controller = new OrderController();

  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'order-service' }));
  app.post('/orders', controller.createOrder);
  app.get('/order/vendor/:vendor_uid/menu', (_req, res) => res.json({ status: 'success', menu: [] }));
  app.post('/user/:firebase_uid/orders', controller.createOrder);
  app.get('/user/:firebase_uid/orders', controller.listOrders);
  app.get('/user/:firebase_uid/orders/:order_id', controller.getOrder);
  app.post('/user/:firebase_uid/orders/:order_id/cancel', controller.cancelOrder);
  app.post('/user/:firebase_uid/orders/:order_id/rate', controller.rateOrder);
  app.get('/vendor/:firebase_uid/orders', controller.listOrders);
  app.put('/vendor/:firebase_uid/orders/:order_id/status', controller.updateStatus);
  app.put('/admin/:firebase_uid/orders/:order_id/status', controller.updateStatus);
  app.get('/laundry/clothes', (_req, res) => res.json({ status: 'success', clothes: [] }));
  app.post('/user/:firebase_uid/laundry/order', controller.createOrder);
  app.get('/user/:firebase_uid/laundry/orders', controller.listOrders);
  app.get('/user/:firebase_uid/laundry/orders/:order_id', controller.getOrder);
  app.post('/user/:firebase_uid/laundry/orders/:order_id/cancel', controller.getOrder);
  app.post('/user/ride/request', controller.createOrder);
  app.get('/user/ride/:ride_id/status', (_req, res) => res.json({ status: 'requested' }));
  app.get('/user/ride/:ride_id/location', (_req, res) => res.json({ location: { lat: 6.5244, lng: 3.3792 } }));
  app.post('/user/ride/:ride_id/cancel', controller.getOrder);
}

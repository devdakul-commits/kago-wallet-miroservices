import express from 'express';
import { fileURLToPath } from 'node:url';
import { buildEnvelope, EVENT_TYPES } from '../shared/events/event-contract.js';

function respond(res, payload, status = 200) {
  res.status(status).json(payload);
}

function registerOrderRoutes(app) {
  app.get('/health', (req, res) => {
    respond(res, { status: 'ok', service: 'order-service' });
  });

  app.post('/orders', (req, res) => {
    const { orderId = 'order-001', userId = 'user-001', amount = 120 } = req.body;
    const event = buildEnvelope(EVENT_TYPES.ORDER_CREATED, { orderId, userId, amount });
    console.log('[order-service] emitted event', event.eventType);
    respond(res, { success: true, orderId, status: 'created', event });
  });

  app.get('/order/vendor/:vendor_uid/menu', (req, res) => {
    respond(res, { service: 'order-service', endpoint: '/order/vendor/menu', vendorUid: req.params.vendor_uid, menu: [] });
  });

  app.post('/user/:firebase_uid/orders', (req, res) => {
    const { orderType = 'food', deliveryAddress = '', paymentMethod = 'wallet', items = [], vendorUid = '' } = req.body;
    const validatedItems = items.map((item) => ({
      menuItemId: item.menuItemId || item.MenuItemID || 0,
      quantity: item.quantity || item.Quantity || 1,
      notes: item.notes || item.Notes || ''
    }));

    const totalAmount = validatedItems.reduce((sum, item) => sum + item.quantity * 120, 0);
    const orderId = `order-${Date.now()}`;
    const event = buildEnvelope(EVENT_TYPES.ORDER_CREATED, {
      orderId,
      userId: req.params.firebase_uid,
      amount: totalAmount,
      orderType,
      vendorUid,
      paymentMethod,
      deliveryAddress,
      items: validatedItems,
    });

    respond(res, {
      status: 'success',
      order: {
        id: orderId,
        firebaseUid: req.params.firebase_uid,
        vendorUid,
        orderType,
        items: validatedItems,
        totalAmount,
        status: 'pending',
        deliveryAddress,
        paymentMethod,
      },
      message: `${orderType} order created. Amount ₦${totalAmount.toFixed(2)} deducted from wallet`,
      event,
    }, 201);
  });

  app.get('/user/:firebase_uid/orders', (req, res) => {
    respond(res, { service: 'order-service', endpoint: '/user/orders', userId: req.params.firebase_uid, orders: [] });
  });

  app.get('/user/:firebase_uid/orders/:order_id', (req, res) => {
    respond(res, { service: 'order-service', endpoint: '/user/orders/details', orderId: req.params.order_id, userId: req.params.firebase_uid });
  });

  app.post('/user/:firebase_uid/orders/:order_id/cancel', (req, res) => {
    respond(res, { service: 'order-service', endpoint: '/user/orders/cancel', orderId: req.params.order_id, userId: req.params.firebase_uid, action: 'cancelled' });
  });

  app.post('/user/:firebase_uid/orders/:order_id/rate', (req, res) => {
    respond(res, { service: 'order-service', endpoint: '/user/orders/rate', orderId: req.params.order_id, userId: req.params.firebase_uid, payload: req.body });
  });

  app.get('/vendor/:firebase_uid/orders', (req, res) => {
    respond(res, { service: 'order-service', endpoint: '/vendor/orders', vendorId: req.params.firebase_uid, orders: [] });
  });

  app.put('/vendor/:firebase_uid/orders/:order_id/status', (req, res) => {
    respond(res, { service: 'order-service', endpoint: '/vendor/orders/status', orderId: req.params.order_id, vendorId: req.params.firebase_uid, payload: req.body });
  });

  app.put('/admin/:firebase_uid/orders/:order_id/status', (req, res) => {
    respond(res, { service: 'order-service', endpoint: '/admin/orders/status', orderId: req.params.order_id, adminId: req.params.firebase_uid, payload: req.body });
  });

  app.get('/laundry/clothes', (req, res) => {
    respond(res, { service: 'order-service', endpoint: '/laundry/clothes', clothes: [] });
  });

  app.post('/user/:firebase_uid/laundry/order', (req, res) => {
    respond(res, { service: 'order-service', endpoint: '/user/laundry/order', userId: req.params.firebase_uid, payload: req.body });
  });

  app.get('/user/:firebase_uid/laundry/orders', (req, res) => {
    respond(res, { service: 'order-service', endpoint: '/user/laundry/orders', userId: req.params.firebase_uid, orders: [] });
  });

  app.get('/user/:firebase_uid/laundry/orders/:order_id', (req, res) => {
    respond(res, { service: 'order-service', endpoint: '/user/laundry/orders/details', orderId: req.params.order_id, userId: req.params.firebase_uid });
  });

  app.post('/user/:firebase_uid/laundry/orders/:order_id/cancel', (req, res) => {
    respond(res, { service: 'order-service', endpoint: '/user/laundry/orders/cancel', orderId: req.params.order_id, userId: req.params.firebase_uid });
  });

  app.post('/user/ride/request', (req, res) => {
    respond(res, { service: 'order-service', endpoint: '/user/ride/request', payload: req.body });
  });

  app.get('/user/ride/:ride_id/status', (req, res) => {
    respond(res, { service: 'order-service', endpoint: '/user/ride/status', rideId: req.params.ride_id, status: 'requested' });
  });

  app.get('/user/ride/:ride_id/location', (req, res) => {
    respond(res, { service: 'order-service', endpoint: '/user/ride/location', rideId: req.params.ride_id, location: { lat: 6.5244, lng: 3.3792 } });
  });

  app.post('/user/ride/:ride_id/cancel', (req, res) => {
    respond(res, { service: 'order-service', endpoint: '/user/ride/cancel', rideId: req.params.ride_id });
  });

  app.use((req, res) => {
    respond(res, { error: 'Route not found', service: 'order-service' }, 404);
  });
}

const app = express();
app.use(express.json());
registerOrderRoutes(app);

const port = process.env.PORT || 3002;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(port, () => {
    console.log(`[order-service] listening on port ${port}`);
  });
}

export { app, registerOrderRoutes };

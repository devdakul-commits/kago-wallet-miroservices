import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import { createServer } from 'node:http';

import { registerOrderRoutes } from './server.js';

function startServer() {
  const app = express();
  app.use(express.json());
  registerOrderRoutes(app);
  return createServer(app);
}

test('create order endpoint returns order details and emits event', async () => {
  const server = startServer();
  await new Promise((resolve) => server.listen(0, resolve));

  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;

  const response = await fetch(`http://127.0.0.1:${port}/user/user-123/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderType: 'food',
      deliveryAddress: '12, Main Street',
      paymentMethod: 'wallet',
      items: [{ menuItemId: 1, quantity: 2, notes: 'extra' }],
      vendorUid: 'vendor-1'
    })
  });

  const body = await response.json();
  assert.equal(response.status, 201);
  assert.equal(body.status, 'success');
  assert.equal(body.order.orderType, 'food');
  assert.ok(body.event);

  await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
});

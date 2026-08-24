import { Order } from '../models/orderModels.js';

const orders = new Map<string, Order>();

export class OrderRepository {
  create(order: Order) {
    orders.set(order.id, order);
    return order;
  }

  listByUser(firebaseUid: string) {
    return Array.from(orders.values()).filter((order) => order.firebaseUid === firebaseUid);
  }

  listByVendor(vendorUid: string) {
    return Array.from(orders.values()).filter((order) => order.vendorUid === vendorUid);
  }

  getById(orderId: string) {
    return orders.get(orderId);
  }

  update(order: Order) {
    orders.set(order.id, order);
    return order;
  }
}

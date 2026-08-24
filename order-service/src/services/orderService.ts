import { randomUUID } from 'node:crypto';
import { Order, CreateOrderInput } from '../models/orderModels.js';
import { OrderRepository } from '../repositories/orderRepository.js';
import { eventBus, EVENT_TYPES } from '../../shared/events/eventBus.js';

export class OrderService {
  constructor(private readonly repository = new OrderRepository()) {}

  createOrder(input: CreateOrderInput) {
    const totalAmount = input.items.reduce((sum, item) => sum + 120 * item.quantity, 0);
    const order: Order = {
      id: `order-${randomUUID()}`,
      firebaseUid: input.firebaseUid,
      vendorUid: input.vendorUid,
      orderType: input.orderType,
      items: input.items.map((item) => ({
        menuItemId: item.menuItemId,
        itemName: `Item ${item.menuItemId}`,
        price: 120,
        quantity: item.quantity,
        total: 120 * item.quantity,
        notes: item.notes,
      })),
      totalAmount,
      status: 'pending',
      deliveryAddress: input.deliveryAddress,
      deliveryInstructions: input.deliveryInstructions,
      paymentMethod: input.paymentMethod,
      estimatedTime: input.estimatedTime ?? 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const createdOrder = this.repository.create(order);
    const event = eventBus.publish(EVENT_TYPES.ORDER_CREATED, {
      orderId: createdOrder.id,
      userId: input.firebaseUid,
      amount: totalAmount,
      orderType: input.orderType,
      vendorUid: input.vendorUid,
      paymentMethod: input.paymentMethod,
      items: input.items.map((item) => ({ menuItemId: item.menuItemId, quantity: item.quantity })),
    });
    return { order: createdOrder, event };
  }

  listOrders(firebaseUid: string) {
    return this.repository.listByUser(firebaseUid);
  }

  listOrdersByVendor(vendorUid: string) {
    return this.repository.listByVendor(vendorUid);
  }

  getOrder(orderId: string) {
    return this.repository.getById(orderId);
  }

  updateStatus(orderId: string, status: string) {
    const order = this.repository.getById(orderId);
    if (!order) return undefined;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    return this.repository.update(order);
  }

  cancelOrder(orderId: string) {
    const order = this.repository.getById(orderId);
    if (!order) return undefined;
    order.status = 'cancelled';
    order.updatedAt = new Date().toISOString();
    return this.repository.update(order);
  }

  rateOrder(orderId: string, rating: number, review?: string) {
    const order = this.repository.getById(orderId);
    if (!order) return undefined;
    order.rating = rating;
    order.review = review;
    order.updatedAt = new Date().toISOString();
    return this.repository.update(order);
  }
}

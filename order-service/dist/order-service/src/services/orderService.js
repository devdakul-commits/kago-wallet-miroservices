import { randomUUID } from 'node:crypto';
import { OrderRepository } from '../repositories/orderRepository.js';
import { eventBus, EVENT_TYPES } from '../../../shared/events/eventBus.js';
export class OrderService {
    repository;
    constructor(repository = new OrderRepository()) {
        this.repository = repository;
    }
    createOrder(input) {
        const totalAmount = input.items.reduce((sum, item) => sum + 120 * item.quantity, 0);
        const order = {
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
        });
        return { order: createdOrder, event };
    }
    listOrders(firebaseUid) {
        return this.repository.listByUser(firebaseUid);
    }
    listOrdersByVendor(vendorUid) {
        return this.repository.listByVendor(vendorUid);
    }
    getOrder(orderId) {
        return this.repository.getById(orderId);
    }
    updateStatus(orderId, status) {
        const order = this.repository.getById(orderId);
        if (!order)
            return undefined;
        order.status = status;
        order.updatedAt = new Date().toISOString();
        return this.repository.update(order);
    }
    cancelOrder(orderId) {
        const order = this.repository.getById(orderId);
        if (!order)
            return undefined;
        order.status = 'cancelled';
        order.updatedAt = new Date().toISOString();
        return this.repository.update(order);
    }
    rateOrder(orderId, rating, review) {
        const order = this.repository.getById(orderId);
        if (!order)
            return undefined;
        order.rating = rating;
        order.review = review;
        order.updatedAt = new Date().toISOString();
        return this.repository.update(order);
    }
}

const orders = new Map();
export class OrderRepository {
    create(order) {
        orders.set(order.id, order);
        return order;
    }
    listByUser(firebaseUid) {
        return Array.from(orders.values()).filter((order) => order.firebaseUid === firebaseUid);
    }
    listByVendor(vendorUid) {
        return Array.from(orders.values()).filter((order) => order.vendorUid === vendorUid);
    }
    getById(orderId) {
        return orders.get(orderId);
    }
    update(order) {
        orders.set(order.id, order);
        return order;
    }
}

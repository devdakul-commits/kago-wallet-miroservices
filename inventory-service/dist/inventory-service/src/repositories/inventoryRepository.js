const inventoryItems = new Map();
const reservations = new Map();
export class InventoryRepository {
    createItem(item) {
        inventoryItems.set(item.id, item);
        return item;
    }
    getItemById(itemId) {
        return inventoryItems.get(itemId);
    }
    findItemByVendorAndSku(vendorUid, sku) {
        return Array.from(inventoryItems.values()).find((item) => item.vendorUid === vendorUid && item.sku === sku);
    }
    listItemsByVendor(vendorUid) {
        return Array.from(inventoryItems.values()).filter((item) => item.vendorUid === vendorUid);
    }
    updateItem(item) {
        inventoryItems.set(item.id, item);
        return item;
    }
    reserveItem(reservation) {
        reservations.set(reservation.id, reservation);
        return reservation;
    }
    listReservationsByOrder(orderId) {
        return Array.from(reservations.values()).filter((reservation) => reservation.orderId === orderId);
    }
}

import { InventoryItem, InventoryReservation } from '../models/inventoryModels.js';

const inventoryItems = new Map<string, InventoryItem>();
const reservations = new Map<string, InventoryReservation>();

export class InventoryRepository {
  createItem(item: InventoryItem) {
    inventoryItems.set(item.id, item);
    return item;
  }

  getItemById(itemId: string) {
    return inventoryItems.get(itemId);
  }

  findItemByVendorAndSku(vendorUid: string, sku: string) {
    return Array.from(inventoryItems.values()).find(
      (item) => item.vendorUid === vendorUid && item.sku === sku
    );
  }

  listItemsByVendor(vendorUid: string) {
    return Array.from(inventoryItems.values()).filter((item) => item.vendorUid === vendorUid);
  }

  updateItem(item: InventoryItem) {
    inventoryItems.set(item.id, item);
    return item;
  }

  reserveItem(reservation: InventoryReservation) {
    reservations.set(reservation.id, reservation);
    return reservation;
  }

  listReservationsByOrder(orderId: string) {
    return Array.from(reservations.values()).filter((reservation) => reservation.orderId === orderId);
  }
}

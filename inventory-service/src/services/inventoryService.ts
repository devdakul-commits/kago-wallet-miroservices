import { randomUUID } from 'node:crypto';
import { InventoryItem, InventoryReservation } from '../models/inventoryModels.js';
import { InventoryRepository } from '../repositories/inventoryRepository.js';

export class InventoryService {
  constructor(private readonly repository = new InventoryRepository()) {}

  addItem(input: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'reserved'>) {
    const item: InventoryItem = {
      ...input,
      id: randomUUID(),
      reserved: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.repository.createItem(item);
  }

  listItems(vendorUid: string) {
    return this.repository.listItemsByVendor(vendorUid);
  }

  reserveItem(orderId: string, itemId: string, quantity: number) {
    const item = this.repository.getItemById(itemId);
    if (!item) return null;
    if (quantity <= 0 || quantity > item.quantity - item.reserved) return null;

    item.reserved += quantity;
    item.updatedAt = new Date().toISOString();
    this.repository.updateItem(item);

    const reservation: InventoryReservation = {
      id: randomUUID(),
      orderId,
      itemId,
      quantity,
      reservedAt: new Date().toISOString(),
    };

    return this.repository.reserveItem(reservation);
  }

  reserveOrderItems(orderId: string, vendorUid: string, items: Array<{ menuItemId: number; quantity: number }>) {
    const results = items.map((item) => {
      const sku = String(item.menuItemId);
      const inventoryItem = this.repository.findItemByVendorAndSku(vendorUid, sku);
      if (!inventoryItem) {
        return { item, reserved: false, reason: 'Inventory item not found' };
      }

      const reservation = this.reserveItem(orderId, inventoryItem.id, item.quantity);
      if (!reservation) {
        return { item, reserved: false, reason: 'Insufficient inventory or invalid quantity' };
      }

      return { item, reserved: true, reservationId: reservation.id };
    });

    return {
      orderId,
      vendorUid,
      reservedItems: results.filter((r) => r.reserved),
      failedItems: results.filter((r) => !r.reserved),
    };
  }

  getItem(itemId: string) {
    return this.repository.getItemById(itemId);
  }

  getReservations(orderId: string) {
    return this.repository.listReservationsByOrder(orderId);
  }

  getReservationStatus(orderId: string) {
    const reservations = this.repository.listReservationsByOrder(orderId);
    const items = reservations.map((reservation) => {
      const item = this.repository.getItemById(reservation.itemId);
      return {
        reservationId: reservation.id,
        orderId: reservation.orderId,
        itemId: reservation.itemId,
        itemName: item?.name ?? null,
        sku: item?.sku ?? null,
        quantity: reservation.quantity,
        reservedAt: reservation.reservedAt,
      };
    });

    return {
      orderId,
      totalReservedQuantity: reservations.reduce((sum, reservation) => sum + reservation.quantity, 0),
      reservationCount: items.length,
      reservations: items,
    };
  }
}

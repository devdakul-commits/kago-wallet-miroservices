export interface InventoryItem {
  id: string;
  vendorUid: string;
  sku: string;
  name: string;
  quantity: number;
  price: number;
  reserved: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryReservation {
  id: string;
  orderId: string;
  itemId: string;
  quantity: number;
  reservedAt: string;
}

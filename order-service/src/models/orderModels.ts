export interface OrderItem {
  menuItemId: number;
  itemName: string;
  price: number;
  quantity: number;
  total: number;
  notes?: string;
}

export interface Order {
  id: string;
  firebaseUid: string;
  vendorUid?: string;
  orderType: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  deliveryAddress: string;
  deliveryInstructions?: string;
  paymentMethod: string;
  estimatedTime: number;
  riderUid?: string;
  rating?: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
  acceptedAt?: string;
  deliveredAt?: string;
}

export interface CreateOrderInput {
  firebaseUid: string;
  vendorUid?: string;
  orderType: string;
  items: Array<{ menuItemId: number; quantity: number; notes?: string }>;
  deliveryAddress: string;
  deliveryInstructions?: string;
  paymentMethod: string;
  estimatedTime?: number;
}

export interface OrderStatusUpdateRequest {
  status: string;
  notes?: string;
  riderUid?: string;
}

export interface OrderRatingRequest {
  rating: number;
  review?: string;
}

export interface VendorMenuItem {
  menuItemId: number;
  itemName: string;
  price: number;
}

export interface LaundryItem {
  id: number;
  name: string;
  price: number;
  active: boolean;
}

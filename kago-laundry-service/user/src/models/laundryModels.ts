export interface LaundryCloth {
  id: number;
  name: string;
  price: number;
  description?: string;
  icon?: string;
  active: boolean;
  createdAt: string;
}

export interface LaundryOrderItem {
  clothId: number;
  quantity: number;
  price: number;
  total: number;
}

export interface LaundryOrder {
  id: number;
  firebaseUid: string;
  items: LaundryOrderItem[];
  totalAmount: number;
  status: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  pickupTime?: string;
  deliveryTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLaundryOrderRequest {
  items: Array<{ clothId: number; quantity: number }>;
  pickupAddress?: string;
  deliveryAddress?: string;
  pickupTime?: string;
  notes?: string;
  useWallet?: boolean;
}

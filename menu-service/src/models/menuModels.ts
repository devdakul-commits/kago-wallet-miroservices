export interface VendorMenuItem {
  id: number;
  firebaseUid: string;
  fileUrl: string;
  fileName: string;
  description: string;
  price: string;
  time: string;
  createdAt: string;
}

export interface CreateMenuItemInput {
  firebaseUid: string;
  description: string;
  price: string;
  time: string;
  fileUrl: string;
  fileName: string;
}

export interface UpdateMenuItemInput {
  description?: string;
  price?: string;
  time?: string;
}

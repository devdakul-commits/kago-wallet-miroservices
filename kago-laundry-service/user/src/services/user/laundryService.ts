import { LaundryCloth, CreateLaundryOrderRequest, LaundryOrderItem } from '../../models/laundryModels.js';
import { LaundryRepository } from '../../repositories/user/laundryRepository.js';

export class LaundryService {
  constructor(private readonly repo = new LaundryRepository()) {}

  async listClothes(): Promise<LaundryCloth[]> {
    return this.repo.listClothes();
  }

  async createOrder(firebaseUid: string, req: CreateLaundryOrderRequest) {
    // validate items and compute total
    let totalAmount = 0;
    const items: LaundryOrderItem[] = [];

    for (const it of req.items) {
      const price = await this.repo.getClothPrice(it.clothId);
      if (price === null) throw new Error(`Invalid cloth ID: ${it.clothId}`);
      const itemTotal = price * Number(it.quantity);
      totalAmount += itemTotal;
      items.push({ clothId: it.clothId, quantity: it.quantity, price, total: itemTotal });
    }

    // If useWallet, check balance
    if (req.useWallet) {
      const balRes = await this.repo.getUserWalletBalance(firebaseUid);
      if (balRes === null) throw new Error('Wallet not found');
      if (balRes < totalAmount) {
        const e: any = new Error('Insufficient wallet balance');
        e.code = 'INSUFFICIENT_FUNDS';
        e.available = balRes;
        e.required = totalAmount;
        throw e;
      }
    }

    const orderId = await this.repo.createOrder(firebaseUid, totalAmount, req);

    for (const item of items) {
      await this.repo.insertOrderItem(orderId, item);
    }

    if (req.useWallet) {
      await this.repo.deductFromWallet(firebaseUid, totalAmount);
      await this.repo.creditAdminWallet(totalAmount);
      await this.repo.insertWalletTransaction(firebaseUid, 'debit', totalAmount, 'Laundry Service', 'laundry_order', orderId, 'completed');
    }

    return { orderId, items, totalAmount };
  }

  async getUserOrders(firebaseUid: string) {
    return this.repo.getUserOrders(firebaseUid);
  }

  async getOrderDetails(orderId: number, firebaseUid: string) {
    return this.repo.getOrderDetails(orderId, firebaseUid);
  }

  async cancelOrder(orderId: number, firebaseUid: string) {
    return this.repo.cancelOrder(orderId, firebaseUid);
  }
}

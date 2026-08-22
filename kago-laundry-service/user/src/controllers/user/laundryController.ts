import { Request, Response } from 'express';
import { LaundryService } from '../../services/user/laundryService.js';
import { sendError, sendJson } from '../../utils/http.js';
import { CreateLaundryOrderRequest } from '../../models/laundryModels.js';

export class LaundryController {
  constructor(private readonly service = new LaundryService()) {}

  listClothes = async (_req: Request, res: Response) => {
    try {
      const clothes = await this.service.listClothes();
      sendJson(res, { status: 'success', clothes });
    } catch (err: any) {
      sendError(res, 500, 'Failed to fetch clothes');
    }
  };

  createOrder = async (req: Request, res: Response) => {
    const firebaseUid = String(req.params.firebase_uid ?? '');
    if (!firebaseUid) return sendError(res, 400, 'firebase_uid required');

    const payload: CreateLaundryOrderRequest = {
      items: Array.isArray(req.body.items) ? req.body.items : [],
      pickupAddress: String(req.body.pickupAddress ?? req.body.pickup_address ?? ''),
      deliveryAddress: String(req.body.deliveryAddress ?? req.body.delivery_address ?? ''),
      pickupTime: req.body.pickupTime ?? req.body.pickup_time ?? null,
      notes: String(req.body.notes ?? ''),
      useWallet: Boolean(req.body.useWallet ?? req.body.use_wallet ?? false),
    };

    if (payload.items.length === 0) return sendError(res, 400, 'No items in order');

    try {
      const result = await this.service.createOrder(firebaseUid, payload);
      sendJson(res, { status: 'success', orderId: result.orderId, items: result.items, totalAmount: result.totalAmount, message: `Order created successfully. Amount ₦${result.totalAmount.toFixed(2)} ${payload.useWallet ? 'deducted from wallet' : 'pending payment'}` }, 201);
    } catch (err: any) {
      if (err.code === 'INSUFFICIENT_FUNDS') {
        return res.status(402).json({ error: 'Insufficient wallet balance', required: err.required, available: err.available, shortfall: err.required - err.available });
      }
      sendError(res, 500, err.message || 'Failed to create order');
    }
  };

  getUserOrders = async (req: Request, res: Response) => {
    const firebaseUid = String(req.params.firebase_uid ?? '');
    if (!firebaseUid) return sendError(res, 400, 'firebase_uid required');

    try {
      const orders = await this.service.getUserOrders(firebaseUid);
      sendJson(res, { status: 'success', orders, count: orders.length });
    } catch (err: any) {
      sendError(res, 500, 'Failed to fetch orders');
    }
  };

  getOrderDetails = async (req: Request, res: Response) => {
    const firebaseUid = String(req.params.firebase_uid ?? '');
    const orderId = Number(req.params.order_id ?? 0);
    if (!firebaseUid || !orderId) return sendError(res, 400, 'firebase_uid and order_id required');

    try {
      const order = await this.service.getOrderDetails(orderId, firebaseUid);
      if (!order) return sendError(res, 404, 'Order not found');
      sendJson(res, { status: 'success', order });
    } catch (err: any) {
      sendError(res, 500, 'Failed to fetch order details');
    }
  };

  cancelOrder = async (req: Request, res: Response) => {
    const firebaseUid = String(req.params.firebase_uid ?? '');
    const orderId = Number(req.params.order_id ?? 0);
    if (!firebaseUid || !orderId) return sendError(res, 400, 'firebase_uid and order_id required');

    try {
      const result = await this.service.cancelOrder(orderId, firebaseUid);
      if (result === null) return sendError(res, 404, 'Order not found');
      if (result === -1) return sendError(res, 400, 'Cannot cancel order with current status');
      sendJson(res, { status: 'success', message: `Order cancelled. Amount ₦${result.toFixed(2)} refunded to wallet` });
    } catch (err: any) {
      sendError(res, 500, 'Failed to cancel order');
    }
  };
}

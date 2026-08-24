import { Request, Response } from 'express';
import { OrderService } from '../services/orderService.js';
import { sendError, sendJson } from '../utils/http.js';
import { CreateOrderInput, OrderRatingRequest, OrderStatusUpdateRequest } from '../models/orderModels.js';

export class OrderController {
  constructor(private readonly service = new OrderService()) {}

  createOrder = (req: Request, res: Response) => {
    const firebaseUid = String(req.body.firebaseUid ?? req.body.firebase_uid ?? req.params.firebase_uid ?? '');
    const payload: CreateOrderInput = {
      firebaseUid,
      vendorUid: String(req.body.vendorUid ?? req.body.vendor_uid ?? ''),
      orderType: String(req.body.orderType ?? req.body.order_type ?? ''),
      deliveryAddress: String(req.body.deliveryAddress ?? req.body.delivery_address ?? ''),
      deliveryInstructions: String(req.body.deliveryInstructions ?? req.body.delivery_instructions ?? ''),
      paymentMethod: String(req.body.paymentMethod ?? req.body.payment_method ?? ''),
      estimatedTime: Number(req.body.estimatedTime ?? req.body.estimated_time ?? 30),
      items: Array.isArray(req.body.items) ? req.body.items : [],
    };

    if (!payload.firebaseUid || !payload.orderType || !payload.deliveryAddress || !payload.paymentMethod) {
      return sendError(res, 400, 'Missing required fields');
    }

    const result = this.service.createOrder(payload);
    sendJson(res, { status: 'success', order: result.order, event: result.event, message: `${payload.orderType} order created` }, 201);
  };

  listOrders = (req: Request, res: Response) => {
    const firebaseUid = String(req.params.firebase_uid ?? '');
    const vendorUid = String(req.params.vendor_uid ?? '');

    if (vendorUid) {
      const orders = this.service.listOrdersByVendor(vendorUid);
      return sendJson(res, { status: 'success', orders, count: orders.length });
    }

    if (!firebaseUid) {
      return sendError(res, 400, 'User or vendor UID required');
    }

    const orders = this.service.listOrders(firebaseUid);
    sendJson(res, { status: 'success', orders, count: orders.length });
  };

  getOrder = (req: Request, res: Response) => {
    const orderId = String(req.params.order_id ?? '');
    const order = this.service.getOrder(orderId);
    if (!order) return sendError(res, 404, 'Order not found');
    sendJson(res, { status: 'success', order });
  };

  updateStatus = (req: Request, res: Response) => {
    const orderId = String(req.params.order_id ?? '');
    const payload: OrderStatusUpdateRequest = {
      status: String(req.body?.status ?? 'pending'),
      notes: String(req.body?.notes ?? req.body?.note ?? ''),
      riderUid: String(req.body?.riderUid ?? req.body?.rider_uid ?? ''),
    };

    const order = this.service.updateStatus(orderId, payload.status);
    if (!order) return sendError(res, 404, 'Order not found');
    sendJson(res, { status: 'success', message: `Order status updated to ${order.status}`, order });
  };

  cancelOrder = (req: Request, res: Response) => {
    const orderId = String(req.params.order_id ?? '');
    const order = this.service.cancelOrder(orderId);
    if (!order) return sendError(res, 404, 'Order not found');
    sendJson(res, { status: 'success', message: 'Order cancelled', order });
  };

  rateOrder = (req: Request, res: Response) => {
    const orderId = String(req.params.order_id ?? '');
    const payload: OrderRatingRequest = {
      rating: Number(req.body?.rating ?? req.body?.stars ?? 0),
      review: String(req.body?.review ?? req.body?.comments ?? ''),
    };

    if (payload.rating <= 0 || payload.rating > 5) {
      return sendError(res, 400, 'Rating must be between 1 and 5');
    }

    const order = this.service.rateOrder(orderId, payload.rating, payload.review);
    if (!order) return sendError(res, 404, 'Order not found');
    sendJson(res, { status: 'success', message: 'Order rated successfully', order });
  };
}

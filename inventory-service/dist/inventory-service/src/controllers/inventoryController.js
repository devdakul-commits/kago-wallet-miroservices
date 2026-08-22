import { InventoryService } from '../services/inventoryService.js';
import { sendError, sendJson } from '../utils/http.js';
export class InventoryController {
    service;
    constructor(service = new InventoryService()) {
        this.service = service;
    }
    addItem = (req, res) => {
        const payload = {
            vendorUid: String(req.body.vendorUid ?? req.body.vendor_uid ?? ''),
            sku: String(req.body.sku ?? ''),
            name: String(req.body.name ?? ''),
            quantity: Number(req.body.quantity ?? 0),
            price: Number(req.body.price ?? 0),
        };
        if (!payload.vendorUid || !payload.sku || !payload.name || payload.quantity <= 0 || payload.price <= 0) {
            return sendError(res, 400, 'Invalid inventory item payload');
        }
        const item = this.service.addItem(payload);
        sendJson(res, { status: 'success', item }, 201);
    };
    listItems = (req, res) => {
        const vendorUid = String(req.params.vendor_uid ?? '');
        if (!vendorUid)
            return sendError(res, 400, 'Vendor UID required');
        const items = this.service.listItems(vendorUid);
        sendJson(res, { status: 'success', items, count: items.length });
    };
    getItem = (req, res) => {
        const itemId = String(req.params.item_id ?? '');
        const item = this.service.getItem(itemId);
        if (!item)
            return sendError(res, 404, 'Item not found');
        sendJson(res, { status: 'success', item });
    };
    reserveItem = (req, res) => {
        const orderId = String(req.body.orderId ?? req.body.order_id ?? '');
        const itemId = String(req.body.itemId ?? req.body.item_id ?? '');
        const quantity = Number(req.body.quantity ?? 0);
        if (!orderId || !itemId || quantity <= 0) {
            return sendError(res, 400, 'Invalid reservation payload');
        }
        const reservation = this.service.reserveItem(orderId, itemId, quantity);
        if (!reservation)
            return sendError(res, 400, 'Unable to reserve item');
        sendJson(res, { status: 'success', reservation }, 201);
    };
    getReservations = (req, res) => {
        const orderId = String(req.params.order_id ?? '');
        if (!orderId)
            return sendError(res, 400, 'Order ID required');
        const reservations = this.service.getReservations(orderId);
        sendJson(res, { status: 'success', reservations, count: reservations.length });
    };
    getReservationStatus = (req, res) => {
        const orderId = String(req.params.order_id ?? '');
        if (!orderId)
            return sendError(res, 400, 'Order ID required');
        const status = this.service.getReservationStatus(orderId);
        sendJson(res, { status: 'success', reservationStatus: status });
    };
}

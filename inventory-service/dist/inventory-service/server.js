import express from 'express';
import { registerInventoryRoutes } from './src/routes/inventoryRoutes.js';
import { InventoryService } from './src/services/inventoryService.js';
import { eventBus, EVENT_TYPES } from '../shared/events/eventBus.js';
const app = express();
app.use(express.json());
registerInventoryRoutes(app);
const inventoryService = new InventoryService();
eventBus.subscribe(EVENT_TYPES.ORDER_CREATED, (envelope) => {
    const data = envelope.data;
    const vendorUid = String(data.vendorUid ?? '');
    const items = Array.isArray(data.items) ? data.items : [];
    if (!vendorUid || items.length === 0) {
        console.log('[inventory-service] order.created event received with no vendorUid or items, skipping reservation');
        return;
    }
    const result = inventoryService.reserveOrderItems(data.orderId, vendorUid, items);
    console.log('[inventory-service] processed order.created event', {
        orderId: data.orderId,
        vendorUid,
        reservedCount: result.reservedItems.length,
        failedCount: result.failedItems.length,
    });
});
app.use((req, res) => res.status(404).json({ error: 'Route not found', service: 'inventory-service' }));
const port = process.env.PORT || 3006;
app.listen(port, () => console.log(`[inventory-service] listening on port ${port}`));

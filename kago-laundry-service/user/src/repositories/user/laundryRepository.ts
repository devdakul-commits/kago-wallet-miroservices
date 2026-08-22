import { LaundryCloth, LaundryOrder, LaundryOrderItem } from '../../models/laundryModels.js';
import { query, getClient } from '../../../../../shared/db/index.js';

export class LaundryRepository {
  async listClothes(): Promise<LaundryCloth[]> {
    const res = await query(`SELECT id, name, price, description, icon, active, created_at FROM laundry_clothes WHERE active=true ORDER BY name ASC`);
    return res.rows.map((r: any) => ({
      id: Number(r.id),
      name: r.name,
      price: Number(r.price),
      description: r.description,
      icon: r.icon,
      active: Boolean(r.active),
      createdAt: r.created_at?.toISOString?.() ?? String(r.created_at),
    }));
  }

  async getClothPrice(clothId: number): Promise<number | null> {
    const res = await query(`SELECT price FROM laundry_clothes WHERE id=$1 AND active=true`, [clothId]);
    if (res.rowCount === 0) return null;
    return Number(res.rows[0].price);
  }

  async createOrder(firebaseUid: string, totalAmount: number, req: any): Promise<number> {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      const now = new Date();
      const insert = await client.query(`INSERT INTO laundry_orders (firebase_uid, total_amount, status, pickup_address, delivery_address, pickup_time, notes, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
        [firebaseUid, totalAmount, 'pending', req.pickupAddress ?? null, req.deliveryAddress ?? null, req.pickupTime ?? null, req.notes ?? null, now, now]);
      const orderId = insert.rows[0].id;
      await client.query('COMMIT');
      return orderId;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async insertOrderItem(orderId: number, item: LaundryOrderItem) {
    await query(`INSERT INTO laundry_order_items (order_id, cloth_id, quantity, price, total) VALUES ($1,$2,$3,$4,$5)`, [orderId, item.clothId, item.quantity, item.price, item.total]);
  }

  async getUserOrders(firebaseUid: string): Promise<LaundryOrder[]> {
    const res = await query(`SELECT id, firebase_uid, total_amount, status, pickup_address, delivery_address, pickup_time, delivery_time, notes, created_at, updated_at FROM laundry_orders WHERE firebase_uid=$1 ORDER BY created_at DESC LIMIT 50`, [firebaseUid]);
    const orders: LaundryOrder[] = [];
    for (const row of res.rows) {
      const order: LaundryOrder = {
        id: Number(row.id),
        firebaseUid: row.firebase_uid,
        items: [],
        totalAmount: Number(row.total_amount),
        status: row.status,
        pickupAddress: row.pickup_address,
        deliveryAddress: row.delivery_address,
        pickupTime: row.pickup_time?.toISOString?.() ?? row.pickup_time,
        deliveryTime: row.delivery_time?.toISOString?.() ?? row.delivery_time,
        notes: row.notes,
        createdAt: row.created_at?.toISOString?.() ?? row.created_at,
        updatedAt: row.updated_at?.toISOString?.() ?? row.updated_at,
      };

      const itemsRes = await query(`SELECT cloth_id, quantity, price, total FROM laundry_order_items WHERE order_id=$1`, [order.id]);
      order.items = itemsRes.rows.map((ir: any) => ({ clothId: ir.cloth_id, quantity: Number(ir.quantity), price: Number(ir.price), total: Number(ir.total) }));
      orders.push(order);
    }
    return orders;
  }

  async getOrderDetails(orderId: number, firebaseUid: string): Promise<LaundryOrder | null> {
    const res = await query(`SELECT id, firebase_uid, total_amount, status, pickup_address, delivery_address, pickup_time, delivery_time, notes, created_at, updated_at FROM laundry_orders WHERE id=$1 AND firebase_uid=$2`, [orderId, firebaseUid]);
    if (res.rowCount === 0) return null;
    const row = res.rows[0];
    const order: LaundryOrder = {
      id: Number(row.id),
      firebaseUid: row.firebase_uid,
      items: [],
      totalAmount: Number(row.total_amount),
      status: row.status,
      pickupAddress: row.pickup_address,
      deliveryAddress: row.delivery_address,
      pickupTime: row.pickup_time?.toISOString?.() ?? row.pickup_time,
      deliveryTime: row.delivery_time?.toISOString?.() ?? row.delivery_time,
      notes: row.notes,
      createdAt: row.created_at?.toISOString?.() ?? row.created_at,
      updatedAt: row.updated_at?.toISOString?.() ?? row.updated_at,
    };

    const itemsRes = await query(`SELECT cloth_id, quantity, price, total FROM laundry_order_items WHERE order_id=$1`, [order.id]);
    order.items = itemsRes.rows.map((ir: any) => ({ clothId: ir.cloth_id, quantity: Number(ir.quantity), price: Number(ir.price), total: Number(ir.total) }));
    return order;
  }

  async cancelOrder(orderId: number, firebaseUid: string): Promise<number | null> {
    // Fetch order status and total
    const res = await query(`SELECT id, status, total_amount FROM laundry_orders WHERE id=$1 AND firebase_uid=$2`, [orderId, firebaseUid]);
    if (res.rowCount === 0) return null;
    const row = res.rows[0];
    const currentStatus = row.status;
    if (currentStatus === 'ready' || currentStatus === 'completed' || currentStatus === 'cancelled') {
      return -1; // indicate cannot cancel
    }

    await query(`UPDATE laundry_orders SET status=$1, updated_at=NOW() WHERE id=$2`, ['cancelled', orderId]);

    // Refund wallet: simple implementation
    await query(`UPDATE wallet SET wallet_balance = wallet_balance + $1, updated_at = NOW() WHERE firebase_uid = $2`, [row.total_amount, firebaseUid]);
    await query(`UPDATE wallet SET wallet_balance = wallet_balance - $1, updated_at = NOW() WHERE firebase_uid = $2`, [row.total_amount, 'admin@kago.io']);

    return Number(row.total_amount);
  }

  async getUserWalletBalance(firebaseUid: string): Promise<number | null> {
    const res = await query(`SELECT wallet_balance FROM wallet WHERE firebase_uid = $1`, [firebaseUid]);
    if (res.rowCount === 0) return null;
    return Number(res.rows[0].wallet_balance);
  }

  async deductFromWallet(firebaseUid: string, amount: number) {
    await query(`UPDATE wallet SET wallet_balance = wallet_balance - $1, updated_at = NOW() WHERE firebase_uid = $2`, [amount, firebaseUid]);
  }

  async creditAdminWallet(amount: number) {
    await query(`UPDATE wallet SET wallet_balance = wallet_balance + $1, updated_at = NOW() WHERE firebase_uid = $2`, [amount, 'admin@kago.io']);
  }

  async insertWalletTransaction(firebaseUid: string, ttype: string, amount: number, description: string, referenceType: string, referenceId: number, status: string) {
    await query(`INSERT INTO wallet_transactions (firebase_uid, type, amount, description, reference_type, reference_id, status, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())`, [firebaseUid, ttype, amount, description, referenceType, referenceId, status]);
  }
}

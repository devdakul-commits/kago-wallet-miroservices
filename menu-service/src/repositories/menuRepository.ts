import { query } from '../../shared/db/index.js';
import { VendorMenuItem, CreateMenuItemInput, UpdateMenuItemInput } from '../models/menuModels.js';

export class MenuRepository {
  async listByVendor(firebaseUid: string): Promise<VendorMenuItem[]> {
    const result = await query(`
      SELECT id, firebase_uid, file_url, file_name, description, price, time, created_at
      FROM menu_items
      WHERE firebase_uid = $1 AND is_deleted = FALSE
      ORDER BY created_at DESC`,
      [firebaseUid],
    );

    return result.rows.map((row: any) => ({
      id: row.id,
      firebaseUid: row.firebase_uid,
      fileUrl: row.file_url,
      fileName: row.file_name,
      description: row.description,
      price: row.price,
      time: row.time,
      createdAt: row.created_at?.toISOString?.() ?? String(row.created_at),
    }));
  }

  async getPublicMenu(firebaseUid: string): Promise<VendorMenuItem[]> {
    return this.listByVendor(firebaseUid);
  }

  async createMenuItem(input: CreateMenuItemInput): Promise<VendorMenuItem> {
    const result = await query(`
      INSERT INTO menu_items (firebase_uid, file_url, file_name, description, price, time, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING id, firebase_uid, file_url, file_name, description, price, time, created_at`,
      [input.firebaseUid, input.fileUrl, input.fileName, input.description, input.price, input.time, new Date()],
    );

    const row = result.rows[0];
    return {
      id: row.id,
      firebaseUid: row.firebase_uid,
      fileUrl: row.file_url,
      fileName: row.file_name,
      description: row.description,
      price: row.price,
      time: row.time,
      createdAt: row.created_at?.toISOString?.() ?? String(row.created_at),
    };
  }

  async updateMenuItem(id: string, firebaseUid: string, input: UpdateMenuItemInput): Promise<void> {
    const setClauses: string[] = [];
    const values: unknown[] = [];

    if (input.description !== undefined) {
      setClauses.push('description = $' + (values.length + 1));
      values.push(input.description);
    }
    if (input.price !== undefined) {
      setClauses.push('price = $' + (values.length + 1));
      values.push(input.price);
    }
    if (input.time !== undefined) {
      setClauses.push('time = $' + (values.length + 1));
      values.push(input.time);
    }

    if (setClauses.length === 0) return;

    values.push(id, firebaseUid);
    await query(`
      UPDATE menu_items
      SET ${setClauses.join(', ')}, updated_at = NOW()
      WHERE id = $${values.length - 1} AND firebase_uid = $${values.length}`,
      values,
    );
  }

  async softDeleteMenuItem(id: string, firebaseUid: string): Promise<void> {
    await query(`
      UPDATE menu_items
      SET is_deleted = TRUE
      WHERE id = $1 AND firebase_uid = $2 AND is_deleted = FALSE`,
      [id, firebaseUid],
    );
  }

  async restoreMenuItem(id: string, firebaseUid: string): Promise<void> {
    await query(`
      UPDATE menu_items
      SET is_deleted = FALSE
      WHERE id = $1 AND firebase_uid = $2 AND is_deleted = TRUE`,
      [id, firebaseUid],
    );
  }
}

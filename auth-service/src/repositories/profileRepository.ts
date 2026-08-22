import { query, getClient } from '../../shared/db/index.js';

export interface ProfileRecord {
  firebaseUid: string;
  display_name: string;
  email: string;
  phone?: string;
  photo_url?: string | null;
  address?: string | null;
  cac_document?: string | null;
  valid_id?: string | null;
  business_image?: string | null;
  updated_at?: string | null;
}

const fallbackProfiles = new Map<string, ProfileRecord>();

export class ProfileRepository {
  async getByFirebaseUid(firebaseUid: string): Promise<ProfileRecord | null> {
    try {
      const res = await query(`SELECT firebase_uid, display_name, email, phone, photo_url, address, cac_document, valid_id, business_image, updated_at FROM profiles WHERE firebase_uid=$1`, [firebaseUid]);
      if (res.rowCount === 0) return null;
      const r = res.rows[0];
      return {
        firebaseUid: r.firebase_uid,
        display_name: r.display_name,
        email: r.email,
        phone: r.phone,
        photo_url: r.photo_url,
        address: r.address,
        cac_document: r.cac_document,
        valid_id: r.valid_id,
        business_image: r.business_image,
        updated_at: r.updated_at?.toISOString?.() ?? String(r.updated_at),
      };
    } catch (err) {
      // Fallback to in-memory store
      return fallbackProfiles.get(firebaseUid) ?? null;
    }
  }

  async upsert(firebaseUid: string, data: Partial<ProfileRecord> & Pick<ProfileRecord, 'email' | 'display_name'>) {
    try {
      const now = new Date();
      const displayName = (data as any).display_name ?? (data as any).fullName ?? 'Kago User';
      const email = (data as any).email ?? 'user@example.com';
      await query(`INSERT INTO profiles (firebase_uid, display_name, email, phone, photo_url, address, cac_document, valid_id, business_image, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        ON CONFLICT (firebase_uid) DO UPDATE SET
          display_name = EXCLUDED.display_name,
          email = EXCLUDED.email,
          phone = COALESCE(EXCLUDED.phone, profiles.phone),
          photo_url = COALESCE(EXCLUDED.photo_url, profiles.photo_url),
          address = COALESCE(EXCLUDED.address, profiles.address),
          cac_document = COALESCE(EXCLUDED.cac_document, profiles.cac_document),
          valid_id = COALESCE(EXCLUDED.valid_id, profiles.valid_id),
          business_image = COALESCE(EXCLUDED.business_image, profiles.business_image),
          updated_at = EXCLUDED.updated_at
      `, [firebaseUid, data.display_name, data.email, data.phone ?? null, data.photo_url ?? null, data.address ?? null, data.cac_document ?? null, data.valid_id ?? null, data.business_image ?? null, now]);

      return this.getByFirebaseUid(firebaseUid);
    } catch (err) {
      // fallback in-memory
      const current = fallbackProfiles.get(firebaseUid) ?? { firebaseUid, display_name: (data as any).display_name ?? (data as any).fullName ?? 'Kago User', email: (data as any).email ?? 'user@example.com' } as ProfileRecord;
      const next = { ...current, ...data, firebaseUid } as ProfileRecord;
      fallbackProfiles.set(firebaseUid, next);
      return next;
    }
  }

  async updateField(firebaseUid: string, field: string, value: string) {
    try {
      await query(`UPDATE profiles SET ${field}=$1, updated_at=NOW() WHERE firebase_uid=$2`, [value, firebaseUid]);
      return this.getByFirebaseUid(firebaseUid);
    } catch (err) {
      const current = fallbackProfiles.get(firebaseUid) ?? { firebaseUid, display_name: 'Kago User', email: 'user@example.com' } as ProfileRecord;
      (current as any)[field] = value;
      fallbackProfiles.set(firebaseUid, current);
      return current;
    }
  }

  // In-memory helpers for suggestions/support and checkin (DB-backed implementations can be added later)
  addSuggestion(firebaseUid: string, suggestion: string) {
    const current = fallbackProfiles.get(firebaseUid) ?? { firebaseUid, display_name: 'Kago User', email: 'user@example.com' } as ProfileRecord;
    const suggestions = (current as any).suggestions ?? [];
    (current as any).suggestions = [...suggestions, suggestion];
    fallbackProfiles.set(firebaseUid, current);
    return current;
  }

  addSupportMessage(firebaseUid: string, message: string) {
    const current = fallbackProfiles.get(firebaseUid) ?? { firebaseUid, display_name: 'Kago User', email: 'user@example.com' } as ProfileRecord;
    const messages = (current as any).supportMessages ?? [];
    (current as any).supportMessages = [...messages, { id: `${Date.now()}`, message }];
    fallbackProfiles.set(firebaseUid, current);
    return current;
  }

  checkIn(firebaseUid: string) {
    const current = fallbackProfiles.get(firebaseUid) ?? { firebaseUid, display_name: 'Kago User', email: 'user@example.com' } as ProfileRecord;
    const history = (current as any).rewardHistory ?? [];
    (current as any).rewardHistory = [...history, { id: `${Date.now()}`, checkedAt: new Date().toISOString() }];
    fallbackProfiles.set(firebaseUid, current);
    return current;
  }
}

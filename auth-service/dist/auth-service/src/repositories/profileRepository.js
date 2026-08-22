import { query } from '../../../shared/db/index.js';
const fallbackProfiles = new Map();
export class ProfileRepository {
    async getByFirebaseUid(firebaseUid) {
        try {
            const res = await query(`SELECT firebase_uid, display_name, email, phone, photo_url, address, cac_document, valid_id, business_image, updated_at FROM profiles WHERE firebase_uid=$1`, [firebaseUid]);
            if (res.rowCount === 0)
                return null;
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
        }
        catch (err) {
            // Fallback to in-memory store
            return fallbackProfiles.get(firebaseUid) ?? null;
        }
    }
    async upsert(firebaseUid, data) {
        try {
            const now = new Date();
            const displayName = data.display_name ?? data.fullName ?? 'Kago User';
            const email = data.email ?? 'user@example.com';
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
        }
        catch (err) {
            // fallback in-memory
            const current = fallbackProfiles.get(firebaseUid) ?? { firebaseUid, display_name: data.display_name ?? data.fullName ?? 'Kago User', email: data.email ?? 'user@example.com' };
            const next = { ...current, ...data, firebaseUid };
            fallbackProfiles.set(firebaseUid, next);
            return next;
        }
    }
    async updateField(firebaseUid, field, value) {
        try {
            await query(`UPDATE profiles SET ${field}=$1, updated_at=NOW() WHERE firebase_uid=$2`, [value, firebaseUid]);
            return this.getByFirebaseUid(firebaseUid);
        }
        catch (err) {
            const current = fallbackProfiles.get(firebaseUid) ?? { firebaseUid, display_name: 'Kago User', email: 'user@example.com' };
            current[field] = value;
            fallbackProfiles.set(firebaseUid, current);
            return current;
        }
    }
    // In-memory helpers for suggestions/support and checkin (DB-backed implementations can be added later)
    addSuggestion(firebaseUid, suggestion) {
        const current = fallbackProfiles.get(firebaseUid) ?? { firebaseUid, display_name: 'Kago User', email: 'user@example.com' };
        const suggestions = current.suggestions ?? [];
        current.suggestions = [...suggestions, suggestion];
        fallbackProfiles.set(firebaseUid, current);
        return current;
    }
    addSupportMessage(firebaseUid, message) {
        const current = fallbackProfiles.get(firebaseUid) ?? { firebaseUid, display_name: 'Kago User', email: 'user@example.com' };
        const messages = current.supportMessages ?? [];
        current.supportMessages = [...messages, { id: `${Date.now()}`, message }];
        fallbackProfiles.set(firebaseUid, current);
        return current;
    }
    checkIn(firebaseUid) {
        const current = fallbackProfiles.get(firebaseUid) ?? { firebaseUid, display_name: 'Kago User', email: 'user@example.com' };
        const history = current.rewardHistory ?? [];
        current.rewardHistory = [...history, { id: `${Date.now()}`, checkedAt: new Date().toISOString() }];
        fallbackProfiles.set(firebaseUid, current);
        return current;
    }
}

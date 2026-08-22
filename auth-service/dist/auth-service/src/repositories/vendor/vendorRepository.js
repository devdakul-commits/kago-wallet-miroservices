const vendors = new Map();
export class VendorRepository {
    async getByFirebaseUid(firebaseUid) {
        return vendors.get(firebaseUid) ?? null;
    }
    async upsertVendor(input) {
        const current = vendors.get(input.firebaseUid) ?? null;
        const now = new Date().toISOString();
        const record = {
            firebaseUid: input.firebaseUid,
            ownerName: input.ownerName,
            businessName: input.businessName,
            email: input.email,
            phone: input.phone,
            category: input.category,
            bankAccount: input.bankAccount,
            bankName: input.bankName,
            bvn: input.bvn,
            nin: input.nin,
            photoUrl: current?.photoUrl,
            createdAt: current?.createdAt ?? now,
            updatedAt: now,
        };
        vendors.set(input.firebaseUid, record);
        return record;
    }
    async updateVendorProfile(firebaseUid, data) {
        const existing = vendors.get(firebaseUid);
        if (!existing)
            return null;
        const next = {
            ...existing,
            ...data,
            updatedAt: new Date().toISOString(),
        };
        vendors.set(firebaseUid, next);
        return next;
    }
    async setVendorPhotoUrl(firebaseUid, url) {
        const existing = vendors.get(firebaseUid);
        if (!existing)
            return null;
        const next = {
            ...existing,
            photoUrl: url,
            updatedAt: new Date().toISOString(),
        };
        vendors.set(firebaseUid, next);
        return next;
    }
    async setVendorFileField(firebaseUid, field, url) {
        const existing = vendors.get(firebaseUid);
        if (!existing)
            return null;
        const next = {
            ...existing,
            [field]: url,
            updatedAt: new Date().toISOString(),
        };
        vendors.set(firebaseUid, next);
        return next;
    }
}

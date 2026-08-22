export interface VendorRecord {
  id: number;
  firebaseUid: string;
  ownerName: string;
  businessName: string;
  email: string;
  phone: string;
  category?: string;
  bankAccount?: string;
  bankName?: string;
  createdAt: string;
  status: string;
  walletId?: number;
  businessImage?: string;
  cacDocument?: string;
  validId?: string;
  address?: string;
  photoUrl?: string;
}

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

interface IdempotencyResult {
  statusCode: number;
  body: unknown;
  expiresAt: number;
}

const vendors = new Map<number, VendorRecord>();
const rateLimits = new Map<string, RateLimitEntry>();
const idempotencyStore = new Map<string, IdempotencyResult>();

function normalizeStatus(value: string) {
  return String(value ?? '').trim().toLowerCase();
}

function ensureVendorExists(vendorId: number): VendorRecord {
  const existing = vendors.get(vendorId);
  if (existing) return existing;

  const fallback: VendorRecord = {
    id: vendorId,
    firebaseUid: `user-${vendorId}`,
    ownerName: `Vendor ${vendorId}`,
    businessName: `Vendor ${vendorId} Business`,
    email: `vendor${vendorId}@example.com`,
    phone: '+0000000000',
    createdAt: new Date().toISOString(),
    status: 'pending',
  };
  vendors.set(vendorId, fallback);
  return fallback;
}

export class VendorAdminService {
  approveVendor(vendorId: number, status: string) {
    const normalizedStatus = normalizeStatus(status);
    const vendor = ensureVendorExists(vendorId);
    vendor.status = normalizedStatus;
    vendor.createdAt = vendor.createdAt || new Date().toISOString();
    vendors.set(vendorId, vendor);
    return vendor;
  }

  listVendors(statusFilter?: string) {
    const filter = normalizeStatus(statusFilter ?? '');
    const result = Array.from(vendors.values())
      .filter((vendor) => {
        if (!filter) return true;
        return normalizeStatus(vendor.status) === filter;
      })
      .map((vendor) => ({
        ...vendor,
        business_image: vendor.businessImage ? this.buildUrl('uploads/business', vendor.businessImage) : '',
        cac_document: vendor.cacDocument ? this.buildUrl('uploads/cac', vendor.cacDocument) : '',
        valid_id: vendor.validId ? this.buildUrl('uploads/id', vendor.validId) : '',
        category: vendor.category ?? '',
        bank_account: vendor.bankAccount ?? '',
        bank_name: vendor.bankName ?? '',
        address: vendor.address ?? '',
        photo_url: vendor.photoUrl ?? '',
      }));

    return result;
  }

  vendorCheckRateLimit(action: string, maxCount: number, windowSeconds: number) {
    const key = action;
    const now = Date.now();
    const existing = rateLimits.get(key);

    if (!existing || now - existing.windowStart >= windowSeconds * 1000) {
      rateLimits.set(key, { count: 1, windowStart: now });
      return { allowed: true, retryAfter: 0 };
    }

    if (existing.count >= maxCount) {
      const retryAfter = Math.ceil((windowSeconds * 1000 - (now - existing.windowStart)) / 1000);
      return { allowed: false, retryAfter };
    }

    rateLimits.set(key, { count: existing.count + 1, windowStart: existing.windowStart });
    return { allowed: true, retryAfter: 0 };
  }

  vendorExtractIdempotencyKey(req: { header(name: string): string | undefined }) {
    return String(req.header('Idempotency-Key') ?? '').trim();
  }

  vendorCheckIdempotency(key: string) {
    const entry = idempotencyStore.get(key);
    if (!entry || Date.now() > entry.expiresAt) {
      idempotencyStore.delete(key);
      return null;
    }
    return entry;
  }

  vendorStoreIdempotencyResult(key: string, statusCode: number, body: unknown, ttlSeconds: number) {
    if (!key) return;
    idempotencyStore.set(key, {
      statusCode,
      body,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  buildUrl(folder: string, fileName: string) {
    const baseUrl = String(process.env.BASE_URL ?? 'http://localhost:3001').replace(/\/$/, '');
    return `${baseUrl}/${folder}/${fileName}`;
  }
}

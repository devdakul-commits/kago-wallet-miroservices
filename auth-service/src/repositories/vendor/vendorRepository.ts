export interface VendorRecord {
  firebaseUid: string;
  ownerName: string;
  businessName: string;
  email: string;
  phone: string;
  category: string;
  bankAccount: string;
  bankName: string;
  bvn?: string;
  nin?: string;
  photoUrl?: string;
  cac_document?: string;
  valid_id?: string;
  business_image?: string;
  createdAt: string;
  updatedAt: string;
}

const vendors = new Map<string, VendorRecord>();

export class VendorRepository {
  async getByFirebaseUid(firebaseUid: string): Promise<VendorRecord | null> {
    return vendors.get(firebaseUid) ?? null;
  }

  async upsertVendor(input: Partial<VendorRecord> & Pick<VendorRecord, 'firebaseUid' | 'ownerName' | 'businessName' | 'email' | 'phone' | 'category' | 'bankAccount' | 'bankName'>) {
    const current = vendors.get(input.firebaseUid) ?? null;
    const now = new Date().toISOString();
    const record: VendorRecord = {
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

  async updateVendorProfile(firebaseUid: string, data: Partial<Pick<VendorRecord, 'ownerName' | 'businessName' | 'email' | 'phone' | 'category' | 'bankAccount' | 'bankName'>>) {
    const existing = vendors.get(firebaseUid);
    if (!existing) return null;
    const next: VendorRecord = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    vendors.set(firebaseUid, next);
    return next;
  }

  async setVendorPhotoUrl(firebaseUid: string, url: string) {
    const existing = vendors.get(firebaseUid);
    if (!existing) return null;
    const next = {
      ...existing,
      photoUrl: url,
      updatedAt: new Date().toISOString(),
    };
    vendors.set(firebaseUid, next);
    return next;
  }

  async setVendorFileField(firebaseUid: string, field: 'cac_document' | 'valid_id' | 'business_image', url: string) {
    const existing = vendors.get(firebaseUid);
    if (!existing) return null;
    const next = {
      ...existing,
      [field]: url,
      updatedAt: new Date().toISOString(),
    };
    vendors.set(firebaseUid, next);
    return next;
  }
}

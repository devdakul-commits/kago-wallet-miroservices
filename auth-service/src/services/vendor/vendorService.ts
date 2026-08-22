import { VendorRepository, VendorRecord } from '../../repositories/vendor/vendorRepository.js';

export interface CreateVendorInput {
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
}

export class VendorService {
  constructor(private readonly repository = new VendorRepository()) {}

  async createVendor(input: CreateVendorInput) {
    return this.repository.upsertVendor(input);
  }

  async getVendorProfile(firebaseUid: string) {
    return this.repository.getByFirebaseUid(firebaseUid);
  }

  async updateVendorProfile(firebaseUid: string, data: Partial<Pick<VendorRecord, 'ownerName' | 'businessName' | 'email' | 'phone' | 'category' | 'bankAccount' | 'bankName'>>) {
    return this.repository.updateVendorProfile(firebaseUid, data);
  }

  async setVendorPhoto(firebaseUid: string, photoUrl: string) {
    return this.repository.setVendorPhotoUrl(firebaseUid, photoUrl);
  }

  async setVendorField(firebaseUid: string, field: 'cac_document' | 'valid_id' | 'business_image', url: string) {
    return this.repository.setVendorFileField(firebaseUid, field, url);
  }

  async createVendorRemote(input: CreateVendorInput, headers: Record<string,string> = {}) {
    const { postCreateVendor } = await import('../../utils/walletClient.js');
    return postCreateVendor(input, headers);
  }
}

import { VendorRepository } from '../../repositories/vendor/vendorRepository.js';
export class VendorService {
    repository;
    constructor(repository = new VendorRepository()) {
        this.repository = repository;
    }
    async createVendor(input) {
        return this.repository.upsertVendor(input);
    }
    async getVendorProfile(firebaseUid) {
        return this.repository.getByFirebaseUid(firebaseUid);
    }
    async updateVendorProfile(firebaseUid, data) {
        return this.repository.updateVendorProfile(firebaseUid, data);
    }
    async setVendorPhoto(firebaseUid, photoUrl) {
        return this.repository.setVendorPhotoUrl(firebaseUid, photoUrl);
    }
    async setVendorField(firebaseUid, field, url) {
        return this.repository.setVendorFileField(firebaseUid, field, url);
    }
}

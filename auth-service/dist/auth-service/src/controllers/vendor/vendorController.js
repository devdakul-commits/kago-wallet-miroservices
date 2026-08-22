import { VendorService } from '../../services/vendor/vendorService.js';
import { sendError, sendJson } from '../../utils/http.js';
export class VendorController {
    service;
    constructor(service = new VendorService()) {
        this.service = service;
    }
    createVendor = (req, res) => {
        const authUid = String(req.header('X-UID') ?? '');
        const payload = req.body;
        if (!payload.firebaseUid || payload.firebaseUid !== authUid) {
            return sendError(res, 403, 'Unauthorized');
        }
        if (!payload.ownerName || !payload.businessName || !payload.email || !payload.phone || !payload.category || !payload.bankAccount || !payload.bankName) {
            return sendError(res, 400, 'Missing required vendor fields');
        }
        const vendor = this.service.createVendor(payload);
        sendJson(res, { success: true, vendor });
    };
    getVendorProfile = (req, res) => {
        const authUid = String(req.header('X-UID') ?? '');
        const firebaseUid = String(req.params.firebase_uid ?? '');
        if (!authUid || authUid !== firebaseUid) {
            return sendError(res, 403, 'Unauthorized');
        }
        sendJson(res, this.service.getVendorProfile(firebaseUid));
    };
    updateVendorProfile = (req, res) => {
        const authUid = String(req.header('X-UID') ?? '');
        const firebaseUid = String(req.params.firebase_uid ?? '');
        if (!authUid || authUid !== firebaseUid) {
            return sendError(res, 403, 'Unauthorized');
        }
        const updated = this.service.updateVendorProfile(firebaseUid, req.body);
        if (!updated)
            return sendError(res, 404, 'Vendor not found');
        sendJson(res, { success: true, vendor: updated });
    };
    uploadVendorPhoto = (req, res) => {
        const authUid = String(req.header('X-UID') ?? '');
        const firebaseUid = String(req.params.firebase_uid ?? '');
        if (!authUid || authUid !== firebaseUid) {
            return sendError(res, 403, 'Unauthorized');
        }
        const photoUrl = String(req.body.photoUrl ?? '');
        if (!photoUrl) {
            return sendError(res, 400, 'Missing photo URL');
        }
        const updated = this.service.setVendorPhoto(firebaseUid, photoUrl);
        if (!updated)
            return sendError(res, 404, 'Vendor not found');
        sendJson(res, { success: true, vendor: updated });
    };
}

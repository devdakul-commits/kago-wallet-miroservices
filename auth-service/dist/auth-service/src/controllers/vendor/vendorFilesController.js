import { VendorService } from '../../services/vendor/vendorService.js';
import { sendError, sendJson } from '../../utils/http.js';
import { uploadBufferToCloudinary } from '../../utils/cloudinary.js';
export class VendorFilesController {
    service;
    constructor(service = new VendorService()) {
        this.service = service;
    }
    uploadCAC = async (req, res) => {
        const authUid = String(req.header('X-UID') ?? '');
        const firebaseUid = String(req.params.firebase_uid ?? '');
        if (!authUid || authUid !== firebaseUid)
            return sendError(res, 403, 'Unauthorized');
        const file = req.file;
        if (!file)
            return sendError(res, 400, 'Missing file');
        try {
            const url = await uploadBufferToCloudinary(file.buffer, { folder: 'vendor_cac', public_id: `${firebaseUid}_cac` });
            const vendor = await this.service.setVendorField(firebaseUid, 'cac_document', url);
            if (!vendor)
                return sendError(res, 404, 'Vendor not found');
            sendJson(res, { status: 'success', vendor });
        }
        catch (err) {
            sendError(res, 500, 'Upload failed');
        }
    };
    uploadValidID = async (req, res) => {
        const authUid = String(req.header('X-UID') ?? '');
        const firebaseUid = String(req.params.firebase_uid ?? '');
        if (!authUid || authUid !== firebaseUid)
            return sendError(res, 403, 'Unauthorized');
        const file = req.file;
        if (!file)
            return sendError(res, 400, 'Missing file');
        try {
            const url = await uploadBufferToCloudinary(file.buffer, { folder: 'vendor_valid_ids', public_id: `${firebaseUid}_valid_id` });
            const vendor = await this.service.setVendorField(firebaseUid, 'valid_id', url);
            if (!vendor)
                return sendError(res, 404, 'Vendor not found');
            sendJson(res, { status: 'success', vendor });
        }
        catch (err) {
            sendError(res, 500, 'Upload failed');
        }
    };
    uploadBusinessImage = async (req, res) => {
        const authUid = String(req.header('X-UID') ?? '');
        const firebaseUid = String(req.params.firebase_uid ?? '');
        if (!authUid || authUid !== firebaseUid)
            return sendError(res, 403, 'Unauthorized');
        const file = req.file;
        if (!file)
            return sendError(res, 400, 'Missing file');
        try {
            const url = await uploadBufferToCloudinary(file.buffer, { folder: 'vendor_business_images', public_id: `${firebaseUid}_business` });
            const vendor = await this.service.setVendorField(firebaseUid, 'business_image', url);
            if (!vendor)
                return sendError(res, 404, 'Vendor not found');
            sendJson(res, { status: 'success', vendor });
        }
        catch (err) {
            sendError(res, 500, 'Upload failed');
        }
    };
}

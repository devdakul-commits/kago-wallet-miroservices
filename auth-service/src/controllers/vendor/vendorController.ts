import { Request, Response } from 'express';
import { VendorService, CreateVendorInput } from '../../services/vendor/vendorService.js';
import { sendError, sendJson } from '../../utils/http.js';
import { validateBusinessName, validateBVN, validateEmail, validateNIN, validateOwnerName, validatePhone } from '../../services/vendor/vendorValidation.js';
import { uploadBufferToCloudinary } from '../../utils/cloudinary.js';

export class VendorController {
  constructor(private readonly service = new VendorService()) {}

  createVendor = async (req: Request, res: Response) => {
    const authUid = String(req.header('X-UID') ?? '');
    const payload = req.body as CreateVendorInput;
    if (!payload.firebaseUid || payload.firebaseUid !== authUid) {
      return sendError(res, 403, 'Unauthorized');
    }

    const requiredFields = [payload.ownerName, payload.businessName, payload.email, payload.phone, payload.category, payload.bankAccount, payload.bankName];
    const hasMissingFields = requiredFields.some((field) => !String(field).trim());
    if (hasMissingFields) {
      return sendError(res, 400, 'Missing required vendor fields');
    }

    const [ownerValid, ownerError] = validateOwnerName(payload.ownerName);
    if (!ownerValid) return sendError(res, 400, ownerError);

    const [businessValid, businessError] = validateBusinessName(payload.businessName);
    if (!businessValid) return sendError(res, 400, businessError);

    const [emailValid, emailError] = validateEmail(payload.email);
    if (!emailValid) return sendError(res, 400, emailError);

    const [phoneValid, phoneError] = validatePhone(payload.phone);
    if (!phoneValid) return sendError(res, 400, phoneError);

    const [bvnValid, bvnError] = validateBVN(payload.bvn ?? '');
    const [ninValid, ninError] = validateNIN(payload.nin ?? '');
    if (!bvnValid && !ninValid) {
      return sendError(res, 400, bvnError || ninError || 'Either BVN or NIN is required');
    }

    try {
      const idempotencyKey = String(req.header('Idempotency-Key') ?? '');
      const result = await this.service.createVendorRemote(payload, { 'X-UID': authUid, ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}) });
      sendJson(res, { success: true, result });
    } catch (err: any) {
      sendError(res, 500, err?.message ?? 'Failed to create vendor');
    }
  };

  createVendorWithFiles = async (req: Request, res: Response) => {
    const authUid = String(req.header('X-UID') ?? '');
    const body = req.body as Record<string, any>;
    const firebaseUid = String(body.firebaseUid ?? '');
    if (!firebaseUid || firebaseUid !== authUid) return sendError(res, 403, 'Unauthorized');

    const files = (req as any).files as Record<string, Express.Multer.File[]> | undefined;

    const payload: CreateVendorInput = {
      firebaseUid,
      ownerName: String(body.ownerName ?? ''),
      businessName: String(body.businessName ?? ''),
      email: String(body.email ?? ''),
      phone: String(body.phone ?? ''),
      category: String(body.category ?? ''),
      bankAccount: String(body.bankAccount ?? ''),
      bankName: String(body.bankName ?? ''),
      bvn: String(body.bvn ?? ''),
      nin: String(body.nin ?? ''),
    };

    // Upload files if provided
    try {
      if (files && files['cac_document'] && files['cac_document'][0]) {
        const f = files['cac_document'][0];
        payload.cac_document = await uploadBufferToCloudinary(f.buffer, { folder: 'vendor_cac', public_id: `${firebaseUid}_cac` });
      }
      if (files && files['valid_id'] && files['valid_id'][0]) {
        const f = files['valid_id'][0];
        payload.valid_id = await uploadBufferToCloudinary(f.buffer, { folder: 'vendor_valid_ids', public_id: `${firebaseUid}_valid_id` });
      }
      if (files && files['business_image'] && files['business_image'][0]) {
        const f = files['business_image'][0];
        payload.business_image = await uploadBufferToCloudinary(f.buffer, { folder: 'vendor_business_images', public_id: `${firebaseUid}_business` });
      }
    } catch (err: any) {
      return sendError(res, 500, 'File upload failed');
    }

    // Forward to wallet-service
    try {
      const idempotencyKey = String(req.header('Idempotency-Key') ?? '');
      const result = await this.service.createVendorRemote(payload, { 'X-UID': authUid, ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}) });
      sendJson(res, { success: true, result });
    } catch (err: any) {
      sendError(res, 500, err?.message ?? 'Failed to create vendor');
    }
  };

  getVendorProfile = (req: Request, res: Response) => {
    const authUid = String(req.header('X-UID') ?? '');
    const firebaseUid = String(req.params.firebase_uid ?? '');
    if (!authUid || authUid !== firebaseUid) {
      return sendError(res, 403, 'Unauthorized');
    }

    sendJson(res, this.service.getVendorProfile(firebaseUid));
  };

  updateVendorProfile = (req: Request, res: Response) => {
    const authUid = String(req.header('X-UID') ?? '');
    const firebaseUid = String(req.params.firebase_uid ?? '');
    if (!authUid || authUid !== firebaseUid) {
      return sendError(res, 403, 'Unauthorized');
    }

    const updated = this.service.updateVendorProfile(firebaseUid, req.body);
    if (!updated) return sendError(res, 404, 'Vendor not found');
    sendJson(res, { success: true, vendor: updated });
  };

  uploadVendorPhoto = (req: Request, res: Response) => {
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
    if (!updated) return sendError(res, 404, 'Vendor not found');
    sendJson(res, { success: true, vendor: updated });
  };
}

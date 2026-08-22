import { Request, Response } from 'express';
import { VendorService } from '../../services/vendor/vendorService.js';
import { sendError, sendJson } from '../../utils/http.js';
import { uploadBufferToCloudinary } from '../../utils/cloudinary.js';

export class VendorFilesController {
  constructor(private readonly service = new VendorService()) {}

  uploadCAC = async (req: Request, res: Response) => {
    const authUid = String(req.header('X-UID') ?? '');
    const firebaseUid = String(req.params.firebase_uid ?? '');
    if (!authUid || authUid !== firebaseUid) return sendError(res, 403, 'Unauthorized');

    const file = (req as any).file;
    if (!file) return sendError(res, 400, 'Missing file');

    try {
      const url = await uploadBufferToCloudinary(file.buffer, { folder: 'vendor_cac', public_id: `${firebaseUid}_cac` });
      const vendor = await this.service.setVendorField(firebaseUid, 'cac_document', url);
      if (!vendor) return sendError(res, 404, 'Vendor not found');
      sendJson(res, { status: 'success', vendor });
    } catch (err: any) {
      sendError(res, 500, 'Upload failed');
    }
  };

  uploadValidID = async (req: Request, res: Response) => {
    const authUid = String(req.header('X-UID') ?? '');
    const firebaseUid = String(req.params.firebase_uid ?? '');
    if (!authUid || authUid !== firebaseUid) return sendError(res, 403, 'Unauthorized');

    const file = (req as any).file;
    if (!file) return sendError(res, 400, 'Missing file');

    try {
      const url = await uploadBufferToCloudinary(file.buffer, { folder: 'vendor_valid_ids', public_id: `${firebaseUid}_valid_id` });
      const vendor = await this.service.setVendorField(firebaseUid, 'valid_id', url);
      if (!vendor) return sendError(res, 404, 'Vendor not found');
      sendJson(res, { status: 'success', vendor });
    } catch (err: any) {
      sendError(res, 500, 'Upload failed');
    }
  };

  uploadBusinessImage = async (req: Request, res: Response) => {
    const authUid = String(req.header('X-UID') ?? '');
    const firebaseUid = String(req.params.firebase_uid ?? '');
    if (!authUid || authUid !== firebaseUid) return sendError(res, 403, 'Unauthorized');

    const file = (req as any).file;
    if (!file) return sendError(res, 400, 'Missing file');

    try {
      const url = await uploadBufferToCloudinary(file.buffer, { folder: 'vendor_business_images', public_id: `${firebaseUid}_business` });
      const vendor = await this.service.setVendorField(firebaseUid, 'business_image', url);
      if (!vendor) return sendError(res, 404, 'Vendor not found');
      sendJson(res, { status: 'success', vendor });
    } catch (err: any) {
      sendError(res, 500, 'Upload failed');
    }
  };

  uploadAll = async (req: Request, res: Response) => {
    const authUid = String(req.header('X-UID') ?? '');
    const firebaseUid = String(req.params.firebase_uid ?? '');
    if (!authUid || authUid !== firebaseUid) return sendError(res, 403, 'Unauthorized');

    const files = (req as any).files as Record<string, Express.Multer.File[]> | undefined;
    if (!files) return sendError(res, 400, 'Missing files');

    try {
      const results: Record<string, string> = {};

      if (files['cac_document'] && files['cac_document'][0]) {
        const file = files['cac_document'][0];
        const url = await uploadBufferToCloudinary(file.buffer, { folder: 'vendor_cac', public_id: `${firebaseUid}_cac` });
        await this.service.setVendorField(firebaseUid, 'cac_document', url);
        results.cac_document = url;
      }

      if (files['valid_id'] && files['valid_id'][0]) {
        const file = files['valid_id'][0];
        const url = await uploadBufferToCloudinary(file.buffer, { folder: 'vendor_valid_ids', public_id: `${firebaseUid}_valid_id` });
        await this.service.setVendorField(firebaseUid, 'valid_id', url);
        results.valid_id = url;
      }

      if (files['business_image'] && files['business_image'][0]) {
        const file = files['business_image'][0];
        const url = await uploadBufferToCloudinary(file.buffer, { folder: 'vendor_business_images', public_id: `${firebaseUid}_business` });
        await this.service.setVendorField(firebaseUid, 'business_image', url);
        results.business_image = url;
      }

      sendJson(res, { status: 'success', files: results });
    } catch (err: any) {
      sendError(res, 500, 'Upload failed');
    }
  };
}

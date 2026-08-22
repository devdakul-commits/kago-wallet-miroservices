import { Request, Response } from 'express';
import { VendorAdminService } from '../services/vendorAdminService.js';
import { sendError, sendJson } from '../../src/utils/http.js';

export class VendorAdminController {
  constructor(private readonly service = new VendorAdminService()) {}

  approveVendor = (req: Request, res: Response) => {
    const { vendor_id, status } = req.body as { vendor_id?: number; status?: string };
    if (!vendor_id || !status || (status !== 'approved' && status !== 'rejected')) {
      return sendError(res, 400, 'Vendor ID and valid status are required');
    }

    const rateLimit = this.service.vendorCheckRateLimit('approve_vendor', 100, 3600);
    if (!rateLimit.allowed) {
      res.setHeader('Retry-After', String(rateLimit.retryAfter));
      return sendError(res, 429, `Too many approval updates. Retry in ${rateLimit.retryAfter} seconds.`);
    }

    const idempotencyKey = this.service.vendorExtractIdempotencyKey(req);
    if (idempotencyKey) {
      const cached = this.service.vendorCheckIdempotency(idempotencyKey);
      if (cached) {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Idempotency-Key', idempotencyKey);
        return res.status(cached.statusCode).json(cached.body);
      }
    }

    const vendor = this.service.approveVendor(vendor_id, status);
    const response = {
      vendor_id: vendor.id,
      status: vendor.status,
      message: `Vendor ${vendor.id} status updated to ${vendor.status}`,
    };

    if (idempotencyKey) {
      this.service.vendorStoreIdempotencyResult(idempotencyKey, 200, response, 7 * 24 * 3600);
      res.setHeader('Idempotency-Key', idempotencyKey);
    }

    return sendJson(res, response);
  };

  listVendors = (req: Request, res: Response) => {
    const status = String(req.query.status ?? '');
    const vendors = this.service.listVendors(status);
    return sendJson(res, { vendors });
  };
}

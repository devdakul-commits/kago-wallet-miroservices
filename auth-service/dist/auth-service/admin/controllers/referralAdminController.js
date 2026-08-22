import { ReferralAdminService } from '../services/referralAdminService.js';
import { sendError, sendJson } from '../../src/utils/http.js';
const ADMIN_TOKEN_HEADER = 'x-admin-token';
export class ReferralAdminController {
    service;
    constructor(service = new ReferralAdminService()) {
        this.service = service;
    }
    cleanReferralCodes = (req, res) => {
        const adminToken = process.env.ADMIN_TOKEN;
        if (!adminToken) {
            return sendError(res, 500, 'Admin token not configured');
        }
        const requestToken = String(req.header(ADMIN_TOKEN_HEADER) ?? '');
        if (requestToken !== adminToken) {
            return sendError(res, 401, 'Unauthorized');
        }
        const result = this.service.cleanDuplicateReferralCodes();
        return sendJson(res, {
            status: 'success',
            message: result.message,
            updates: result.updates,
        });
    };
}

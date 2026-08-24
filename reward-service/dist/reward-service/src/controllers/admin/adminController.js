import { sendJson } from '../../utils/http.js';
export class AdminController {
    getHealth = (_req, res) => {
        sendJson(res, { status: 'ok', service: 'reward-service-admin' });
    };
}

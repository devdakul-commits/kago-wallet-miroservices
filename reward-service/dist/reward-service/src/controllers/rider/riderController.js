import { sendJson } from '../../utils/http.js';
export class RiderController {
    getHealth = (_req, res) => {
        sendJson(res, { status: 'ok', service: 'reward-service-rider' });
    };
}

import { Request, Response } from 'express';
import { sendJson } from '../../utils/http.js';

export class RiderController {
  getHealth = (_req: Request, res: Response) => {
    sendJson(res, { status: 'ok', service: 'reward-service-rider' });
  };
}

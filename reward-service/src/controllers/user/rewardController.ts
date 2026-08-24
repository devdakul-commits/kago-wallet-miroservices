import { Request, Response } from 'express';
import { RewardService } from '../../services/user/rewardService.js';
import { sendJson, sendError } from '../../utils/http.js';

export class RewardController {
  constructor(private readonly service = new RewardService()) {}

  getDailyStatus = async (req: Request, res: Response) => {
    const firebaseUid = String(req.params.firebase_uid ?? '');
    if (!firebaseUid) return sendError(res, 400, 'firebase_uid required');
    const status = await this.service.getDailyStatus(firebaseUid);
    sendJson(res, status);
  };

  checkIn = async (req: Request, res: Response) => {
    const firebaseUid = String(req.params.firebase_uid ?? '');
    if (!firebaseUid) return sendError(res, 400, 'firebase_uid required');
    const result = await this.service.checkIn(firebaseUid, req.body);
    sendJson(res, result);
  };

  getDailyHistory = async (req: Request, res: Response) => {
    const firebaseUid = String(req.params.firebase_uid ?? '');
    if (!firebaseUid) return sendError(res, 400, 'firebase_uid required');
    const history = await this.service.getDailyHistory(firebaseUid);
    sendJson(res, history);
  };
}

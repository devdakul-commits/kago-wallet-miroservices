import { Request, Response } from 'express';
import { RewardSettingsService } from '../../services/user/rewardSettingsService.js';
import { sendJson, sendError } from '../../utils/http.js';

export class RewardSettingsController {
  constructor(private readonly service = new RewardSettingsService()) {}

  getRewardSettings = async (req: Request, res: Response) => {
    const firebaseUid = String(req.params.firebase_uid ?? '');
    if (!firebaseUid) return sendError(res, 400, 'firebase_uid is required');
    const result = await this.service.getRewardSettings(firebaseUid);
    sendJson(res, result);
  };

  updateRewardSettings = async (req: Request, res: Response) => {
    const firebaseUid = String(req.params.firebase_uid ?? '');
    if (!firebaseUid) return sendError(res, 400, 'firebase_uid is required');
    const result = await this.service.updateRewardSettings(firebaseUid, req.body);
    sendJson(res, result);
  };

  getReferralBalance = async (req: Request, res: Response) => {
    const firebaseUid = String(req.params.firebase_uid ?? '');
    if (!firebaseUid) return sendError(res, 400, 'firebase_uid is required');
    const balance = await this.service.getReferralBalance(firebaseUid);
    sendJson(res, { balance });
  };

  redeemReferralBalance = async (req: Request, res: Response) => {
    const firebaseUid = String(req.params.firebase_uid ?? '');
    if (!firebaseUid) return sendError(res, 400, 'firebase_uid is required');
    const result = await this.service.redeemReferralBalance(firebaseUid);
    sendJson(res, result);
  };

  getReferralHistory = async (req: Request, res: Response) => {
    const firebaseUid = String(req.params.firebase_uid ?? '');
    if (!firebaseUid) return sendError(res, 400, 'firebase_uid is required');
    const history = await this.service.getReferralHistory(firebaseUid);
    sendJson(res, history);
  };
}

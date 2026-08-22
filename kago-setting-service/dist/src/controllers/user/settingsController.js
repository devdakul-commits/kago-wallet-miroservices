import { SettingsService } from '../../services/user/settingsService.js';
import { sendJson, sendError } from '../../utils/http.js';
export class SettingsController {
    service;
    constructor(service = new SettingsService()) {
        this.service = service;
    }
    getNotificationSettings = async (req, res) => {
        const firebaseUid = String(req.params.firebase_uid ?? '');
        if (!firebaseUid)
            return sendError(res, 400, 'firebase_uid is required');
        const result = await this.service.getNotificationSettings(firebaseUid);
        sendJson(res, result);
    };
    updateNotificationSettings = async (req, res) => {
        const firebaseUid = String(req.params.firebase_uid ?? '');
        if (!firebaseUid)
            return sendError(res, 400, 'firebase_uid is required');
        const result = await this.service.updateNotificationSettings(firebaseUid, req.body);
        sendJson(res, result);
    };
    getRewardSettings = async (req, res) => {
        const firebaseUid = String(req.params.firebase_uid ?? '');
        if (!firebaseUid)
            return sendError(res, 400, 'firebase_uid is required');
        const result = await this.service.getRewardSettings(firebaseUid);
        sendJson(res, result);
    };
    updateRewardSettings = async (req, res) => {
        const firebaseUid = String(req.params.firebase_uid ?? '');
        if (!firebaseUid)
            return sendError(res, 400, 'firebase_uid is required');
        const result = await this.service.updateRewardSettings(firebaseUid, req.body);
        sendJson(res, result);
    };
    getReferralBalance = async (req, res) => {
        const firebaseUid = String(req.params.firebase_uid ?? '');
        if (!firebaseUid)
            return sendError(res, 400, 'firebase_uid is required');
        const balance = await this.service.getReferralBalance(firebaseUid);
        sendJson(res, { balance });
    };
    redeemReferralBalance = async (req, res) => {
        const firebaseUid = String(req.params.firebase_uid ?? '');
        if (!firebaseUid)
            return sendError(res, 400, 'firebase_uid is required');
        const result = await this.service.redeemReferralBalance(firebaseUid);
        sendJson(res, result);
    };
    getReferralHistory = async (req, res) => {
        const firebaseUid = String(req.params.firebase_uid ?? '');
        if (!firebaseUid)
            return sendError(res, 400, 'firebase_uid is required');
        const history = await this.service.getReferralHistory(firebaseUid);
        sendJson(res, history);
    };
    getSuggestionSettings = async (req, res) => {
        const firebaseUid = String(req.params.firebase_uid ?? '');
        if (!firebaseUid)
            return sendError(res, 400, 'firebase_uid is required');
        const result = await this.service.getSuggestionSettings(firebaseUid);
        sendJson(res, result);
    };
    updateSuggestionSettings = async (req, res) => {
        const firebaseUid = String(req.params.firebase_uid ?? '');
        if (!firebaseUid)
            return sendError(res, 400, 'firebase_uid is required');
        const result = await this.service.updateSuggestionSettings(firebaseUid, req.body);
        sendJson(res, result);
    };
    getSafetySettings = async (req, res) => {
        const firebaseUid = String(req.params.firebase_uid ?? '');
        if (!firebaseUid)
            return sendError(res, 400, 'firebase_uid is required');
        const result = await this.service.getSafetySettings(firebaseUid);
        sendJson(res, result);
    };
    updateSafetySettings = async (req, res) => {
        const firebaseUid = String(req.params.firebase_uid ?? '');
        if (!firebaseUid)
            return sendError(res, 400, 'firebase_uid is required');
        const result = await this.service.updateSafetySettings(firebaseUid, req.body);
        sendJson(res, result);
    };
}

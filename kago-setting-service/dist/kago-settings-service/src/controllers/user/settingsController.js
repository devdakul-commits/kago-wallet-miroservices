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

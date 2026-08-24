import { SupportService } from '../../services/user/supportService.js';
import { sendError, sendJson } from '../../utils/http.js';
export class SupportController {
    service;
    constructor(service = new SupportService()) {
        this.service = service;
    }
    getMessages = async (req, res) => {
        const firebaseUid = String(req.params.firebase_uid ?? '');
        if (!firebaseUid)
            return sendError(res, 400, 'firebase_uid is required');
        const messages = await this.service.getMessages(firebaseUid);
        sendJson(res, { status: 'success', messages, count: messages.length });
    };
    postMessage = async (req, res) => {
        const firebaseUid = String(req.params.firebase_uid ?? '');
        const payload = {
            firebaseUid,
            message: String(req.body.message ?? ''),
        };
        if (!firebaseUid || !payload.message) {
            return sendError(res, 400, 'firebase_uid and message are required');
        }
        const chatMessage = await this.service.postMessage(payload);
        sendJson(res, { status: 'success', chatMessage, message: 'Message sent successfully' });
    };
    postReport = async (req, res) => {
        const firebaseUid = String(req.params.firebase_uid ?? '');
        const payload = {
            firebaseUid,
            issue: String(req.body.issue ?? ''),
            description: String(req.body.description ?? ''),
        };
        if (!firebaseUid || !payload.issue || !payload.description) {
            return sendError(res, 400, 'firebase_uid, issue, and description are required');
        }
        const report = await this.service.postReport(payload);
        sendJson(res, { status: 'success', report, message: 'Report submitted successfully' });
    };
    getReports = async (req, res) => {
        const firebaseUid = String(req.params.firebase_uid ?? '');
        if (!firebaseUid)
            return sendError(res, 400, 'firebase_uid is required');
        const reports = await this.service.getReports(firebaseUid);
        sendJson(res, { status: 'success', reports, count: reports.length });
    };
    getSuggestions = async (req, res) => {
        const firebaseUid = String(req.params.firebase_uid ?? '');
        if (!firebaseUid)
            return sendError(res, 400, 'firebase_uid is required');
        const suggestions = await this.service.getSuggestions(firebaseUid);
        sendJson(res, { status: 'success', suggestions, count: suggestions.length });
    };
    addSuggestion = async (req, res) => {
        const firebaseUid = String(req.params.firebase_uid ?? '');
        const payload = {
            firebaseUid,
            title: String(req.body.title ?? ''),
            description: String(req.body.description ?? ''),
        };
        if (!firebaseUid || !payload.title || !payload.description) {
            return sendError(res, 400, 'firebase_uid, title, and description are required');
        }
        const suggestion = await this.service.addSuggestion(payload);
        sendJson(res, { status: 'success', suggestion, message: 'Suggestion submitted successfully' });
    };
    getWeather = async (req, res) => {
        const location = String(req.query.location ?? 'oyo');
        try {
            const weather = await this.service.getWeather(location);
            sendJson(res, { status: 'success', weather });
        }
        catch (error) {
            sendError(res, 500, 'Failed to fetch weather');
        }
    };
}

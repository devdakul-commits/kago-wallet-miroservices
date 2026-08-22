import { ChatService } from '../../services/user/chatService.js';
import { sendError, sendJson } from '../../utils/http.js';
export class ChatController {
    service;
    constructor(service = new ChatService()) {
        this.service = service;
    }
    getMessages = async (req, res) => {
        const firebaseUid = String(req.params.firebase_uid ?? '');
        if (!firebaseUid) {
            return sendError(res, 400, 'firebase_uid is required');
        }
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
}

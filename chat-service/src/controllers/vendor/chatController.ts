import { Request, Response } from 'express';
import { VendorChatService } from '../../services/vendor/chatService.js';
import { sendError, sendJson } from '../../utils/http.js';
import { CreateVendorChatMessageInput } from '../../models/chatModels.js';

export class VendorChatController {
  constructor(private readonly service = new VendorChatService()) {}

  getMessages = async (req: Request, res: Response) => {
    const firebaseUid = String(req.params.firebase_uid ?? '');
    if (!firebaseUid) {
      return sendError(res, 400, 'firebase_uid is required');
    }

    const messages = await this.service.getMessages(firebaseUid);
    sendJson(res, { status: 'success', messages, count: messages.length });
  };

  postMessage = async (req: Request, res: Response) => {
    const firebaseUid = String(req.params.firebase_uid ?? '');
    const payload: CreateVendorChatMessageInput = {
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

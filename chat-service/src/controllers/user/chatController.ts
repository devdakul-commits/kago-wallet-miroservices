import { Request, Response } from 'express';
import { ChatService } from '../../services/user/chatService.js';
import { sendError, sendJson } from '../../utils/http.js';
import { CreateChatMessageInput } from '../../models/chatModels.js';

export class ChatController {
  constructor(private readonly service = new ChatService()) {}

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
    const payload: CreateChatMessageInput = {
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

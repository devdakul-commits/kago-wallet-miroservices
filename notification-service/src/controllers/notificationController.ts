import { Request, Response } from 'express';
import { NotificationService } from '../services/notificationService.js';
import { sendError, sendJson } from '../utils/http.js';

export class NotificationController {
  constructor(private readonly service = new NotificationService()) {}

  send = (req: Request, res: Response) => {
    const userId = String(req.body?.userId ?? req.params.userId ?? 'user-001');
    const message = String(req.body?.message ?? 'Order update');
    const channel = String(req.body?.channel ?? 'email');
    if (!message) return sendError(res, 400, 'Message required');
    sendJson(res, this.service.send(userId, message, channel));
  };

  list = (req: Request, res: Response) => {
    const userId = String(req.params.userId ?? 'user-001');
    sendJson(res, { notifications: this.service.list(userId) });
  };
}

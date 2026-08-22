import { Response } from 'express';

export function sendJson(res: Response, payload: unknown, status = 200) {
  res.status(status).json(payload);
}

export function sendError(res: Response, status: number, message: string) {
  sendJson(res, { error: message }, status);
}

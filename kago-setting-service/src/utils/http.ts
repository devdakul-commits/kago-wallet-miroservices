import { Response } from 'express';

export function sendJson(res: Response, payload: unknown) {
  res.status(200).json(payload);
}

export function sendError(res: Response, status: number, message: string) {
  res.status(status).json({ error: message });
}

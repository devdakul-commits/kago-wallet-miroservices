import { Request, Response } from 'express';
import { MenuService } from '../services/menuService.js';
import { sendError, sendJson } from '../utils/http.js';

export class MenuController {
  constructor(private readonly service = new MenuService()) {}

  getMenu = async (req: Request, res: Response) => {
    const authUid = String(req.header('X-UID') ?? '');
    const firebaseUid = String(req.params.firebase_uid ?? '');
    if (!authUid || authUid !== firebaseUid) {
      return sendError(res, 403, 'Unauthorized');
    }

    const menu = await this.service.getMenu(firebaseUid);
    sendJson(res, menu);
  };

  getPublicMenu = async (req: Request, res: Response) => {
    const firebaseUid = String(req.params.firebase_uid ?? '');
    if (!firebaseUid) {
      return sendError(res, 400, 'Firebase UID required');
    }

    const menu = await this.service.getPublicMenu(firebaseUid);
    sendJson(res, menu);
  };

  uploadMenu = async (req: Request, res: Response) => {
    const authUid = String(req.header('X-UID') ?? '');
    const firebaseUid = String(req.params.firebase_uid ?? '');
    if (!authUid || authUid !== firebaseUid) {
      return sendError(res, 403, 'Unauthorized');
    }

    const fileUrl = String(req.body.fileUrl ?? '');
    const fileName = String(req.body.fileName ?? '');
    const description = String(req.body.description ?? '');
    const price = String(req.body.price ?? '');
    const time = String(req.body.time ?? '');

    if (!fileUrl || !fileName || !description || !price || !time) {
      return sendError(res, 400, 'Missing required menu upload fields');
    }

    const item = await this.service.uploadMenuItem({
      firebaseUid,
      fileUrl,
      fileName,
      description,
      price,
      time,
    });

    sendJson(res, item, 201);
  };

  updateMenu = async (req: Request, res: Response) => {
    const authUid = String(req.header('X-UID') ?? '');
    const firebaseUid = String(req.params.firebase_uid ?? '');
    const id = String(req.params.id ?? '');
    if (!authUid || authUid !== firebaseUid) {
      return sendError(res, 403, 'Unauthorized');
    }

    await this.service.updateMenuItem(id, firebaseUid, req.body);
    res.sendStatus(204);
  };

  deleteMenu = async (req: Request, res: Response) => {
    const authUid = String(req.header('X-UID') ?? '');
    const firebaseUid = String(req.params.firebase_uid ?? '');
    const id = String(req.params.id ?? '');
    if (!authUid || authUid !== firebaseUid) {
      return sendError(res, 403, 'Unauthorized');
    }

    await this.service.deleteMenuItem(id, firebaseUid);
    res.sendStatus(204);
  };

  restoreMenu = async (req: Request, res: Response) => {
    const authUid = String(req.header('X-UID') ?? '');
    const firebaseUid = String(req.params.firebase_uid ?? '');
    const id = String(req.params.id ?? '');
    if (!authUid || authUid !== firebaseUid) {
      return sendError(res, 403, 'Unauthorized');
    }

    await this.service.restoreMenuItem(id, firebaseUid);
    res.sendStatus(204);
  };
}

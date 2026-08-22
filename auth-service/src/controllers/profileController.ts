import { Request, Response } from 'express';
import { ProfileService } from '../services/profileService.js';
import { sendError, sendJson } from '../utils/http.js';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL ?? '' });

export class ProfileController {
  constructor(private readonly service = new ProfileService()) {}

  login = (req: Request, res: Response) => {
    const { userId = 'user-001', email = 'user@example.com' } = req.body as Record<string, string>;
    sendJson(res, this.service.login(userId, email));
  };

  weather = (_req: Request, res: Response) => sendJson(res, { service: 'auth-service', data: this.service.getWeather() });

  getProfile = (req: Request, res: Response) => {
    const firebaseUid = String(req.params.firebase_uid ?? '');
    // enforce simple auth: X-UID header must match requested UID
    const authUid = String(req.header('X-UID') ?? '');
    if (authUid && authUid !== firebaseUid) return sendError(res, 403, 'Unauthorized');
    sendJson(res, this.service.getProfile(firebaseUid));
  };

  updateProfile = (req: Request, res: Response) => {
    const firebaseUid = String(req.params.firebase_uid ?? '');
    const authUid = String(req.header('X-UID') ?? '');
    if (authUid && authUid !== firebaseUid) return sendError(res, 403, 'Unauthorized');
    // idempotency handled in service if needed
    sendJson(res, this.service.updateProfile(firebaseUid, req.body));
  };

  uploadPhoto = async (req: Request, res: Response) => {
    const firebaseUid = String(req.params.firebase_uid ?? '');
    const authUid = String(req.header('X-UID') ?? '');
    if (authUid && authUid !== firebaseUid) return sendError(res, 403, 'Unauthorized');
    const file = (req as any).file;
    if (!file) return sendError(res, 400, 'Missing file');

    try {
      const url = await uploadBufferToCloudinary(file.buffer, { folder: 'profile_photos', public_id: firebaseUid });
      const profile = await this.service.setProfileField(firebaseUid, 'photo_url', url);
      sendJson(res, { status: 'success', profile });
    } catch (err: any) {
      sendError(res, 500, 'Upload failed');
    }
  };

  uploadCAC = async (req: Request, res: Response) => {
    const firebaseUid = String(req.params.firebase_uid ?? '');
    const authUid = String(req.header('X-UID') ?? '');
    if (authUid && authUid !== firebaseUid) return sendError(res, 403, 'Unauthorized');
    const file = (req as any).file;
    if (!file) return sendError(res, 400, 'Missing file');

    try {
      const url = await uploadBufferToCloudinary(file.buffer, { folder: 'cac_documents', public_id: `${firebaseUid}_cac` });
      const profile = await this.service.setProfileField(firebaseUid, 'cac_document', url);
      sendJson(res, { status: 'success', profile });
    } catch (err: any) {
      sendError(res, 500, 'Upload failed');
    }
  };

  uploadValidID = async (req: Request, res: Response) => {
    const firebaseUid = String(req.params.firebase_uid ?? '');
    const authUid = String(req.header('X-UID') ?? '');
    if (authUid && authUid !== firebaseUid) return sendError(res, 403, 'Unauthorized');
    const file = (req as any).file;
    if (!file) return sendError(res, 400, 'Missing file');

    try {
      const url = await uploadBufferToCloudinary(file.buffer, { folder: 'valid_ids', public_id: `${firebaseUid}_valid_id` });
      const profile = await this.service.setProfileField(firebaseUid, 'valid_id', url);
      sendJson(res, { status: 'success', profile });
    } catch (err: any) {
      sendError(res, 500, 'Upload failed');
    }
  };

  uploadBusinessImage = async (req: Request, res: Response) => {
    const firebaseUid = String(req.params.firebase_uid ?? '');
    const authUid = String(req.header('X-UID') ?? '');
    if (authUid && authUid !== firebaseUid) return sendError(res, 403, 'Unauthorized');
    const file = (req as any).file;
    if (!file) return sendError(res, 400, 'Missing file');

    try {
      const url = await uploadBufferToCloudinary(file.buffer, { folder: 'business_images', public_id: `${firebaseUid}_business` });
      const profile = await this.service.setProfileField(firebaseUid, 'business_image', url);
      sendJson(res, { status: 'success', profile });
    } catch (err: any) {
      sendError(res, 500, 'Upload failed');
    }
  };
  updateNotificationSettings = (req: Request, res: Response) => {
    const firebaseUid = String(req.params.firebase_uid ?? '');
    sendJson(res, this.service.updateNotificationSettings(firebaseUid, req.body));
  };

  updateRewardSettings = (req: Request, res: Response) => {
    const firebaseUid = String(req.params.firebase_uid ?? '');
    sendJson(res, this.service.updateRewardSettings(firebaseUid, req.body));
  };

  updateSafetySettings = (req: Request, res: Response) => {
    const firebaseUid = String(req.params.firebase_uid ?? '');
    sendJson(res, this.service.updateSafetySettings(firebaseUid, req.body));
  };

  getSuggestions = (req: Request, res: Response) => {
    const firebaseUid = String(req.params.firebase_uid ?? '');
    sendJson(res, this.service.getSuggestions(firebaseUid));
  };

  addSuggestion = (req: Request, res: Response) => {
    const firebaseUid = String(req.params.firebase_uid ?? '');
    const suggestion = String(req.body?.suggestion ?? '');
    if (!suggestion) return sendError(res, 400, 'Suggestion required');
    sendJson(res, this.service.addSuggestion(firebaseUid, suggestion));
  };

  getSupportMessages = (req: Request, res: Response) => {
    const firebaseUid = String(req.params.firebase_uid ?? '');
    sendJson(res, this.service.getSupportMessages(firebaseUid));
  };

  addSupportMessage = (req: Request, res: Response) => {
    const firebaseUid = String(req.params.firebase_uid ?? '');
    const message = String(req.body?.message ?? '');
    if (!message) return sendError(res, 400, 'Message required');
    sendJson(res, this.service.addSupportMessage(firebaseUid, message));
  };

  getRewardStatus = (req: Request, res: Response) => {
    const firebaseUid = String(req.params.firebase_uid ?? '');
    sendJson(res, this.service.getRewardStatus(firebaseUid));
  };

  checkIn = (req: Request, res: Response) => {
    const firebaseUid = String(req.params.firebase_uid ?? '');
    sendJson(res, this.service.checkIn(firebaseUid));
  };
}

async function uploadBufferToCloudinary(buffer: Buffer, opts: { folder?: string; public_id?: string }) {
  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: opts.folder, public_id: opts.public_id }, (error, result) => {
      if (error) return reject(error);
      if (!result || !result.secure_url) return reject(new Error('No upload result'));
      resolve(result.secure_url);
    });
    stream.end(buffer);
  });
}

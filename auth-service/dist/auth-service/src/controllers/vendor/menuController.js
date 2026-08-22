import { v2 as cloudinary } from 'cloudinary';
import { MenuService } from '../../services/vendor/menuService.js';
import { sendError, sendJson } from '../../utils/http.js';
export class MenuController {
    service;
    constructor(service = new MenuService()) {
        this.service = service;
    }
    getMenu = async (req, res) => {
        const authUid = String(req.header('X-UID') ?? '');
        const firebaseUid = String(req.params.firebase_uid ?? '');
        if (!authUid || authUid !== firebaseUid) {
            return sendError(res, 403, 'Unauthorized');
        }
        const menu = await this.service.getMenu(firebaseUid);
        sendJson(res, menu);
    };
    getPublicMenu = async (req, res) => {
        const firebaseUid = String(req.params.firebase_uid ?? '');
        if (!firebaseUid) {
            return sendError(res, 400, 'Firebase UID required');
        }
        const menu = await this.service.getPublicMenu(firebaseUid);
        sendJson(res, menu);
    };
    uploadMenu = async (req, res) => {
        const authUid = String(req.header('X-UID') ?? '');
        const firebaseUid = String(req.params.firebase_uid ?? '');
        if (!authUid || authUid !== firebaseUid) {
            return sendError(res, 403, 'Unauthorized');
        }
        const file = req.file;
        if (!file) {
            return sendError(res, 400, 'Missing file');
        }
        const description = String(req.body.description ?? '');
        const price = String(req.body.price ?? '');
        const time = String(req.body.time ?? '');
        if (!description || !price || !time) {
            return sendError(res, 400, 'Missing required menu fields');
        }
        const cld = cloudinary;
        cld.config({ secure: true });
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cld.uploader.upload_stream({
                folder: `menu/${firebaseUid}`,
                public_id: file.originalname,
                resource_type: 'image',
            }, (error, uploadResult) => {
                if (error)
                    return reject(error);
                resolve(uploadResult);
            });
            uploadStream.end(file.buffer);
        });
        if (!result || !result.secure_url) {
            return sendError(res, 500, 'Failed to upload file');
        }
        const item = await this.service.uploadMenuItem({
            firebaseUid,
            fileUrl: result.secure_url,
            fileName: file.originalname,
            description,
            price,
            time,
        });
        sendJson(res, item, 201);
    };
    updateMenu = async (req, res) => {
        const authUid = String(req.header('X-UID') ?? '');
        const firebaseUid = String(req.params.firebase_uid ?? '');
        const id = String(req.params.id ?? '');
        if (!authUid || authUid !== firebaseUid) {
            return sendError(res, 403, 'Unauthorized');
        }
        await this.service.updateMenuItem(id, firebaseUid, req.body);
        res.sendStatus(204);
    };
    deleteMenu = async (req, res) => {
        const authUid = String(req.header('X-UID') ?? '');
        const firebaseUid = String(req.params.firebase_uid ?? '');
        const id = String(req.params.id ?? '');
        if (!authUid || authUid !== firebaseUid) {
            return sendError(res, 403, 'Unauthorized');
        }
        await this.service.deleteMenuItem(id, firebaseUid);
        res.sendStatus(204);
    };
    restoreMenu = async (req, res) => {
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

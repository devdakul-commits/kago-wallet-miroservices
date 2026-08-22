import { Router } from 'express';
import { VendorController } from '../controllers/vendor/vendorController.js';
import { MenuController } from '../controllers/vendor/menuController.js';
import { VendorFilesController } from '../controllers/vendor/vendorFilesController.js';
import multer from 'multer';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const allowedExts = ['.pdf', '.png', '.jpg', '.jpeg'];

function fileFilter(_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const name = file.originalname || '';
  const ext = name.slice(((name.lastIndexOf('.') - 1) >>> 0) + 1).toLowerCase();
  const dotExt = '.' + ext;
  if (!allowedExts.includes(dotExt)) return cb(new Error('Invalid file type'));
  cb(null, true);
}

export function registerVendorRoutes(app: Router) {
  const controller = new VendorController();
  const menuController = new MenuController();
  const filesController = new VendorFilesController();
  const upload = multer({ storage: multer.memoryStorage(), fileFilter, limits: { fileSize: MAX_FILE_SIZE } });

  app.post('/vendor/create', controller.createVendor);
  // New: endpoint to create vendor and upload files in one multipart request
  app.post('/vendor/create-with-files', upload.fields([
    { name: 'cac_document', maxCount: 1 },
    { name: 'valid_id', maxCount: 1 },
    { name: 'business_image', maxCount: 1 },
  ]), controller.createVendorWithFiles);
  app.get('/vendor/profile/:firebase_uid', controller.getVendorProfile);
  app.put('/vendor/profile/:firebase_uid', controller.updateVendorProfile);
  app.post('/vendor/profile/:firebase_uid/photo', upload.single('file'), controller.uploadVendorPhoto);

  // Single-file endpoints (kept for backward compatibility)
  app.post('/vendor/profile/:firebase_uid/cac', upload.single('file'), filesController.uploadCAC);
  app.post('/vendor/profile/:firebase_uid/valid-id', upload.single('file'), filesController.uploadValidID);
  app.post('/vendor/profile/:firebase_uid/business-image', upload.single('file'), filesController.uploadBusinessImage);

  // New combined upload endpoint: expects multipart fields 'cac_document','valid_id','business_image'
  app.post(
    '/vendor/profile/:firebase_uid/upload-all',
    upload.fields([
      { name: 'cac_document', maxCount: 1 },
      { name: 'valid_id', maxCount: 1 },
      { name: 'business_image', maxCount: 1 },
    ]),
    filesController.uploadAll,
  );

  app.get('/vendor/menu/:firebase_uid', menuController.getMenu);
  app.get('/vendor/menu/public/:firebase_uid', menuController.getPublicMenu);
  app.post('/vendor/menu/:firebase_uid', upload.single('file'), menuController.uploadMenu);
  app.put('/vendor/menu/:firebase_uid/:id', menuController.updateMenu);
  app.delete('/vendor/menu/:firebase_uid/:id', menuController.deleteMenu);
  app.put('/vendor/menu/:firebase_uid/:id/restore', menuController.restoreMenu);
}

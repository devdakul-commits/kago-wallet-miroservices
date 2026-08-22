import { VendorController } from '../controllers/vendor/vendorController.js';
import { MenuController } from '../controllers/vendor/menuController.js';
import { VendorFilesController } from '../controllers/vendor/vendorFilesController.js';
import multer from 'multer';
export function registerVendorRoutes(app) {
    const controller = new VendorController();
    const menuController = new MenuController();
    const filesController = new VendorFilesController();
    const upload = multer({ storage: multer.memoryStorage() });
    app.post('/vendor/create', controller.createVendor);
    app.get('/vendor/profile/:firebase_uid', controller.getVendorProfile);
    app.put('/vendor/profile/:firebase_uid', controller.updateVendorProfile);
    app.post('/vendor/profile/:firebase_uid/photo', upload.single('file'), controller.uploadVendorPhoto);
    app.post('/vendor/profile/:firebase_uid/cac', upload.single('file'), filesController.uploadCAC);
    app.post('/vendor/profile/:firebase_uid/valid-id', upload.single('file'), filesController.uploadValidID);
    app.post('/vendor/profile/:firebase_uid/business-image', upload.single('file'), filesController.uploadBusinessImage);
    app.get('/vendor/menu/:firebase_uid', menuController.getMenu);
    app.get('/vendor/menu/public/:firebase_uid', menuController.getPublicMenu);
    app.post('/vendor/menu/:firebase_uid', upload.single('file'), menuController.uploadMenu);
    app.put('/vendor/menu/:firebase_uid/:id', menuController.updateMenu);
    app.delete('/vendor/menu/:firebase_uid/:id', menuController.deleteMenu);
    app.put('/vendor/menu/:firebase_uid/:id/restore', menuController.restoreMenu);
}

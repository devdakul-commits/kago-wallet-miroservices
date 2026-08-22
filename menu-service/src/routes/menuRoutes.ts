import { Router } from 'express';
import multer from 'multer';
import { MenuController } from '../controllers/menuController.js';

export function registerMenuRoutes(app: Router) {
  const controller = new MenuController();
  const upload = multer({ storage: multer.memoryStorage() });

  app.get('/vendor/menu/:firebase_uid', controller.getMenu);
  app.get('/vendor/menu/public/:firebase_uid', controller.getPublicMenu);
  app.post('/vendor/menu/:firebase_uid', controller.uploadMenu);
  app.put('/vendor/menu/:firebase_uid/:id', controller.updateMenu);
  app.delete('/vendor/menu/:firebase_uid/:id', controller.deleteMenu);
  app.put('/vendor/menu/:firebase_uid/:id/restore', controller.restoreMenu);
}

import { Router } from 'express';
import { VendorChatController } from '../controllers/vendor/chatController.js';

export function registerVendorChatRoutes(app: Router) {
  const controller = new VendorChatController();

  app.get('/vendor/support/:firebase_uid/messages', controller.getMessages);
  app.post('/vendor/support/:firebase_uid/messages', controller.postMessage);
  app.get('/vendor/:firebase_uid/chat', controller.getMessages);
  app.post('/vendor/:firebase_uid/chat', controller.postMessage);
}

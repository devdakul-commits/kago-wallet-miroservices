import { Router } from 'express';
import { ChatController } from '../controllers/user/chatController.js';

export function registerChatRoutes(app: Router) {
  const controller = new ChatController();

  app.get('/user/:firebase_uid/chat', controller.getMessages);
  app.post('/user/:firebase_uid/chat', controller.postMessage);
}

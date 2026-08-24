import { Router } from 'express';
import { SupportController } from '../controllers/user/supportController.js';

export function registerSupportRoutes(app: Router) {
  const controller = new SupportController();

  app.get('/user/support/:firebase_uid/messages', controller.getMessages);
  app.post('/user/support/:firebase_uid/messages', controller.postMessage);
  app.post('/user/support/:firebase_uid/report', controller.postReport);
  app.get('/user/support/:firebase_uid/reports', controller.getReports);

  app.get('/user/suggestions/:firebase_uid', controller.getSuggestions);
  app.post('/user/suggestions/:firebase_uid', controller.addSuggestion);
  app.get('/weather', controller.getWeather);
}

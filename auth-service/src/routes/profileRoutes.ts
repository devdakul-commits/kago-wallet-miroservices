import { Router } from 'express';
import { ProfileController } from '../controllers/profileController.js';
import multer from 'multer';
import { createRateLimitMiddleware } from '../middleware/rateLimit.js';
import { registerReferralAdminRoutes } from '../../admin/routes/referralAdminRoutes.js';

export function registerProfileRoutes(app: Router) {
  const controller = new ProfileController();
  const rateLimit = createRateLimitMiddleware(60, 60_000);
  registerReferralAdminRoutes(app);

  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'auth-service' }));
  app.post('/auth/login', rateLimit, controller.login);
  app.get('/user/profile/:firebase_uid', controller.getProfile);
  app.put('/user/profile/:firebase_uid', controller.updateProfile);
  const upload = multer({ storage: multer.memoryStorage() });
  app.post('/user/profile/:firebase_uid/photo', upload.single('file'), controller.uploadPhoto);
  app.post('/user/profile/:firebase_uid/cac', upload.single('file'), controller.uploadCAC);
  app.post('/user/profile/:firebase_uid/valid-id', upload.single('file'), controller.uploadValidID);
  app.post('/user/profile/:firebase_uid/business-image', upload.single('file'), controller.uploadBusinessImage);
  app.get('/user/settings/:firebase_uid/notifications', controller.updateNotificationSettings);
  app.put('/user/settings/:firebase_uid/notifications', controller.updateNotificationSettings);
  app.get('/user/settings/:firebase_uid/reward', controller.updateRewardSettings);
  app.put('/user/settings/:firebase_uid/reward', controller.updateRewardSettings);
  app.get('/user/settings/:firebase_uid/referrals', controller.getProfile);
  app.get('/user/settings/:firebase_uid/referrals/balance', controller.getProfile);
  app.post('/user/settings/:firebase_uid/referrals/redeem', controller.updateProfile);
  app.get('/user/settings/:firebase_uid/suggestion', controller.getSuggestions);
  app.put('/user/settings/:firebase_uid/suggestion', controller.updateProfile);
  app.get('/user/settings/:firebase_uid/safety', controller.updateSafetySettings);
  app.put('/user/settings/:firebase_uid/safety', controller.updateSafetySettings);
  app.get('/user/support/:firebase_uid/messages', controller.getSupportMessages);
  app.post('/user/support/:firebase_uid/messages', controller.addSupportMessage);
  app.post('/user/support/:firebase_uid/report', controller.addSupportMessage);
  app.get('/user/support/:firebase_uid/reports', controller.getSupportMessages);
  app.get('/user/reward/daily/status/:firebase_uid', controller.getRewardStatus);
  app.post('/user/reward/daily/checkin/:firebase_uid', controller.checkIn);
  app.get('/user/reward/daily/history/:firebase_uid', controller.getRewardStatus);
  app.get('/user/reward/health', (_req, res) => res.json({ status: 'ok', service: 'auth-service' }));
}

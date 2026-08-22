import { SettingsController } from '../../controllers/user/settingsController.js';
export function registerSettingsUserRoutes(app) {
    const controller = new SettingsController();
    app.get('/user/settings/:firebase_uid/notifications', controller.getNotificationSettings);
    app.put('/user/settings/:firebase_uid/notifications', controller.updateNotificationSettings);
    app.get('/user/settings/:firebase_uid/reward', controller.getRewardSettings);
    app.put('/user/settings/:firebase_uid/reward', controller.updateRewardSettings);
    app.get('/user/settings/:firebase_uid/referrals', controller.getReferralHistory);
    app.get('/user/settings/:firebase_uid/referrals/balance', controller.getReferralBalance);
    app.post('/user/settings/:firebase_uid/referrals/redeem', controller.redeemReferralBalance);
    app.get('/user/settings/:firebase_uid/suggestion', controller.getSuggestionSettings);
    app.put('/user/settings/:firebase_uid/suggestion', controller.updateSuggestionSettings);
    app.get('/user/settings/:firebase_uid/safety', controller.getSafetySettings);
    app.put('/user/settings/:firebase_uid/safety', controller.updateSafetySettings);
}

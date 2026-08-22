import { SettingsController } from '../../controllers/user/settingsController.js';
export function registerSettingsUserRoutes(app) {
    const controller = new SettingsController();
    app.get('/user/settings/:firebase_uid/notifications', controller.getNotificationSettings);
    app.put('/user/settings/:firebase_uid/notifications', controller.updateNotificationSettings);
    app.get('/user/settings/:firebase_uid/suggestion', controller.getSuggestionSettings);
    app.put('/user/settings/:firebase_uid/suggestion', controller.updateSuggestionSettings);
    app.get('/user/settings/:firebase_uid/safety', controller.getSafetySettings);
    app.put('/user/settings/:firebase_uid/safety', controller.updateSafetySettings);
}

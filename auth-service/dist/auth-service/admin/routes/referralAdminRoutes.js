import { ReferralAdminController } from '../controllers/referralAdminController.js';
export function registerReferralAdminRoutes(app) {
    const controller = new ReferralAdminController();
    app.post('/admin/referrals/clean', controller.cleanReferralCodes);
}

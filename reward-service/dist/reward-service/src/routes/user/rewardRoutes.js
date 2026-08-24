import { RewardController } from '../../controllers/user/rewardController.js';
import { RewardSettingsController } from '../../controllers/user/rewardSettingsController.js';
export function registerRewardUserRoutes(app) {
    const rewardController = new RewardController();
    const rewardSettingsController = new RewardSettingsController();
    app.get('/user/reward/daily/status/:firebase_uid', rewardController.getDailyStatus);
    app.post('/user/reward/daily/checkin/:firebase_uid', rewardController.checkIn);
    app.get('/reward/daily/history/:firebase_uid', rewardController.getDailyHistory);
    app.get('/user/settings/:firebase_uid/reward', rewardSettingsController.getRewardSettings);
    app.put('/user/settings/:firebase_uid/reward', rewardSettingsController.updateRewardSettings);
    app.get('/user/settings/:firebase_uid/referrals', rewardSettingsController.getReferralHistory);
    app.get('/user/settings/:firebase_uid/referrals/balance', rewardSettingsController.getReferralBalance);
    app.post('/user/settings/:firebase_uid/referrals/redeem', rewardSettingsController.redeemReferralBalance);
}

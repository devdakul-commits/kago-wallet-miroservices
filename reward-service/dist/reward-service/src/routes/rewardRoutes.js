import { registerRewardUserRoutes } from './user/rewardRoutes.js';
import { registerRewardAdminRoutes } from './admin/adminRoutes.js';
import { registerRewardRiderRoutes } from './rider/riderRoutes.js';
export function registerRewardRoutes(app) {
    registerRewardUserRoutes(app);
    registerRewardAdminRoutes(app);
    registerRewardRiderRoutes(app);
}

import { AdminController } from '../../controllers/admin/adminController.js';
export function registerRewardAdminRoutes(app) {
    const controller = new AdminController();
    app.get('/admin/health', controller.getHealth);
}

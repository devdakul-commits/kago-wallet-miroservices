import { RiderController } from '../../controllers/rider/riderController.js';
export function registerRewardRiderRoutes(app) {
    const controller = new RiderController();
    app.get('/rider/health', controller.getHealth);
}

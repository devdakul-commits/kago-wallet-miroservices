import { RideController } from '../../controllers/user/rideController.js';
export function registerRideUserRoutes(app) {
    const controller = new RideController();
    app.post('/user/ride/request', controller.requestRide);
    app.get('/user/ride/status/:ride_id', controller.getRideStatus);
    app.get('/user/ride/location/:ride_id', controller.getRideLocation);
    app.post('/user/ride/cancel/:ride_id', controller.cancelRide);
}

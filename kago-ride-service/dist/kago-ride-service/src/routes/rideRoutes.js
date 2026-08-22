import { registerRideUserRoutes } from './user/rideRoutes.js';
export function registerRideRoutes(app) {
    registerRideUserRoutes(app);
}

import { LaundryController } from '../controllers/user/laundryController.js';
export function registerLaundryRoutes(app) {
    const controller = new LaundryController();
    app.get('/laundry/clothes', controller.listClothes);
    app.post('/user/:firebase_uid/laundry/order', controller.createOrder);
    app.get('/user/:firebase_uid/laundry/orders', controller.getUserOrders);
    app.get('/user/:firebase_uid/laundry/orders/:order_id', controller.getOrderDetails);
    app.post('/user/:firebase_uid/laundry/orders/:order_id/cancel', controller.cancelOrder);
}

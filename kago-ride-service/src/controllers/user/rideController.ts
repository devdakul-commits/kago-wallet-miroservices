import { Request, Response } from 'express';
import { RideService } from '../../services/user/rideService.js';
import { sendJson, sendError } from '../../utils/http.js';

export class RideController {
  constructor(private readonly service = new RideService()) {}

  requestRide = async (req: Request, res: Response) => {
    const payload = req.body;
    if (!payload?.firebaseUid || !payload?.pickupAddress || !payload?.dropoffAddress) {
      return sendError(res, 400, 'firebase_uid, pickup_address, and dropoff_address are required');
    }

    const result = await this.service.requestRide(payload);
    sendJson(res, result);
  };

  getRideStatus = async (req: Request, res: Response) => {
    const rideId = String(req.params.ride_id ?? '');
    if (!rideId) return sendError(res, 400, 'ride_id is required');

    const ride = await this.service.getRideStatus(rideId);
    if (!ride) return sendError(res, 404, 'Ride not found');

    sendJson(res, ride);
  };

  getRideLocation = async (req: Request, res: Response) => {
    const rideId = String(req.params.ride_id ?? '');
    if (!rideId) return sendError(res, 400, 'ride_id is required');

    const location = await this.service.getRideLocation(rideId);
    if (!location) return sendError(res, 404, 'Ride location not available');

    sendJson(res, location);
  };

  cancelRide = async (req: Request, res: Response) => {
    const rideId = String(req.params.ride_id ?? '');
    if (!rideId) return sendError(res, 400, 'ride_id is required');

    const ride = await this.service.cancelRide(rideId);
    if (!ride) return sendError(res, 404, 'Ride not found');

    sendJson(res, { status: 'cancelled', message: 'Ride was successfully cancelled' });
  };
}

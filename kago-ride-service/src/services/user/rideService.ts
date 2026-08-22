import { randomUUID } from 'node:crypto';
import { RideMeta, RideRequestPayload, RideLocation, RideRequestResponse, RideAssignmentPayload } from '../../models/rideModels.js';
import { RideRepository } from '../../repositories/user/rideRepository.js';

export class RideService {
  constructor(private readonly repository = new RideRepository()) {}

  async requestRide(payload: RideRequestPayload): Promise<RideRequestResponse> {
    const rideId = this.generateRideId();
    const now = new Date().toISOString();

    const meta: RideMeta = {
      rideId,
      firebaseUid: payload.firebaseUid,
      status: 'pending',
      riderUid: 'rider-001',
      riderName: 'Kago Rider',
      estimatedArrivalMinutes: 6,
      pickupAddress: payload.pickupAddress,
      dropoffAddress: payload.dropoffAddress,
      pickupLat: payload.pickupLat,
      pickupLng: payload.pickupLng,
      dropoffLat: payload.dropoffLat,
      dropoffLng: payload.dropoffLng,
      serviceType: payload.serviceType,
      notes: payload.notes,
      scheduledAt: payload.scheduledAt,
      requestedAt: now,
      updatedAt: now,
    };

    await this.repository.saveRide(meta);
    await this.repository.saveLocation(rideId, {
      latitude: payload.pickupLat,
      longitude: payload.pickupLng,
      updatedAt: now,
    });

    await this.repository.enqueueAssignment({
      rideId,
      firebaseUid: payload.firebaseUid,
      riderUid: meta.riderUid,
      currentLat: payload.pickupLat,
      currentLng: payload.pickupLng,
    });

    return {
      rideId: meta.rideId,
      status: meta.status,
      riderName: meta.riderName,
      estimatedArrivalMinutes: meta.estimatedArrivalMinutes,
      pickupAddress: meta.pickupAddress,
      dropoffAddress: meta.dropoffAddress,
      pickupLat: meta.pickupLat,
      pickupLng: meta.pickupLng,
      dropoffLat: meta.dropoffLat,
      dropoffLng: meta.dropoffLng,
      serviceType: meta.serviceType,
      notes: meta.notes,
      scheduledAt: meta.scheduledAt,
      requestedAt: meta.requestedAt,
    };
  }

  async getRideStatus(rideId: string) {
    return this.repository.getRide(rideId);
  }

  async getRideLocation(rideId: string) {
    return this.repository.getLocation(rideId);
  }

  async cancelRide(rideId: string) {
    const meta = await this.repository.getRide(rideId);
    if (!meta) return null;

    meta.status = 'cancelled';
    meta.updatedAt = new Date().toISOString();
    await this.repository.saveRide(meta);
    return meta;
  }

  private generateRideId() {
    return `ride-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }
}

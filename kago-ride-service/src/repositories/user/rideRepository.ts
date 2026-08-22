import { createClient, RedisClientType } from 'redis';
import { RideLocation, RideMeta, RideAssignmentPayload } from '../../models/rideModels.js';

const redisUrl = process.env.REDIS_URL || (process.env.REDIS_HOST ? `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}` : '');
const redisClient: RedisClientType = createClient({ url: redisUrl });
void redisClient.connect();

function rideKey(rideId: string) {
  return `ride:${rideId}`;
}

function locationKey(rideId: string) {
  return `ride:${rideId}:location`;
}

export class RideRepository {
  async saveRide(meta: RideMeta) {
    await redisClient.set(rideKey(meta.rideId), JSON.stringify(meta), { EX: 24 * 60 * 60 });
  }

  async saveLocation(rideId: string, location: RideLocation) {
    await redisClient.set(locationKey(rideId), JSON.stringify(location), { EX: 24 * 60 * 60 });
  }

  async getRide(rideId: string) {
    const payload = await redisClient.get(rideKey(rideId));
    return payload ? (JSON.parse(payload) as RideMeta) : null;
  }

  async getLocation(rideId: string) {
    const payload = await redisClient.get(locationKey(rideId));
    return payload ? (JSON.parse(payload) as RideLocation) : null;
  }

  async enqueueAssignment(payload: RideAssignmentPayload) {
    await redisClient.lPush('ride_assignments', JSON.stringify(payload));
  }
}

import { createClient } from 'redis';
const redisUrl = process.env.REDIS_URL || (process.env.REDIS_HOST ? `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}` : '');
const redisClient = createClient({ url: redisUrl });
void redisClient.connect();
function rideKey(rideId) {
    return `ride:${rideId}`;
}
function locationKey(rideId) {
    return `ride:${rideId}:location`;
}
export class RideRepository {
    async saveRide(meta) {
        await redisClient.set(rideKey(meta.rideId), JSON.stringify(meta), { EX: 24 * 60 * 60 });
    }
    async saveLocation(rideId, location) {
        await redisClient.set(locationKey(rideId), JSON.stringify(location), { EX: 24 * 60 * 60 });
    }
    async getRide(rideId) {
        const payload = await redisClient.get(rideKey(rideId));
        return payload ? JSON.parse(payload) : null;
    }
    async getLocation(rideId) {
        const payload = await redisClient.get(locationKey(rideId));
        return payload ? JSON.parse(payload) : null;
    }
    async enqueueAssignment(payload) {
        await redisClient.lPush('ride_assignments', JSON.stringify(payload));
    }
}

import { randomUUID } from 'node:crypto';
import { createClient } from 'redis';
import { buildEnvelope, EVENT_TYPES } from './event-contract.js';
class EventBus {
    subscribers = new Map();
    redisPub;
    redisSub;
    redisSubscribedEvents = new Set();
    instanceId = randomUUID();
    redisReady = false;
    constructor() {
        void this.initializeRedis();
    }
    async initializeRedis() {
        const redisUrl = process.env.REDIS_URL || (process.env.REDIS_HOST ? `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}` : '');
        if (!redisUrl) {
            return;
        }
        try {
            const pub = createClient({ url: redisUrl });
            const sub = createClient({ url: redisUrl });
            pub.on('error', (err) => console.error('[eventBus] Redis pub error', err));
            sub.on('error', (err) => console.error('[eventBus] Redis sub error', err));
            await Promise.all([pub.connect(), sub.connect()]);
            this.redisPub = pub;
            this.redisSub = sub;
            this.redisReady = true;
            console.log('[eventBus] connected to Redis at', redisUrl);
            for (const eventType of this.redisSubscribedEvents) {
                void this.subscribeRedisTopic(eventType);
            }
        }
        catch (err) {
            console.warn('[eventBus] Redis connection failed, falling back to local event bus', err);
        }
    }
    dispatchLocally(eventType, envelope) {
        const handlers = this.subscribers.get(eventType) ?? new Set();
        handlers.forEach((handler) => handler(envelope));
    }
    async subscribeRedisTopic(eventType) {
        if (!this.redisSub) {
            return;
        }
        try {
            await this.redisSub.subscribe(eventType, (message) => {
                try {
                    const envelope = JSON.parse(message);
                    if (envelope.source === this.instanceId) {
                        return;
                    }
                    this.dispatchLocally(eventType, envelope);
                }
                catch (err) {
                    console.error('[eventBus] failed to parse Redis event', err);
                }
            });
        }
        catch (err) {
            console.error('[eventBus] Redis subscribe failed', err);
        }
    }
    async publishToRedis(envelope) {
        if (!this.redisPub) {
            return;
        }
        try {
            await this.redisPub.publish(envelope.eventType, JSON.stringify(envelope));
        }
        catch (err) {
            console.error('[eventBus] publish to Redis failed', err);
        }
    }
    subscribe(eventType, handler) {
        const handlers = this.subscribers.get(eventType) ?? new Set();
        handlers.add(handler);
        this.subscribers.set(eventType, handlers);
        const alreadySubscribed = this.redisSubscribedEvents.has(eventType);
        if (!alreadySubscribed) {
            this.redisSubscribedEvents.add(eventType);
            if (this.redisReady && this.redisSub) {
                void this.subscribeRedisTopic(eventType);
            }
        }
        return () => {
            handlers.delete(handler);
            if (handlers.size === 0) {
                this.subscribers.delete(eventType);
                if (this.redisSub) {
                    void this.redisSub.unsubscribe(eventType).catch((err) => console.error('[eventBus] Redis unsubscribe failed', err));
                    this.redisSubscribedEvents.delete(eventType);
                }
            }
        };
    }
    publish(eventType, data, correlationId = randomUUID()) {
        const envelope = buildEnvelope(eventType, data, correlationId);
        envelope.source = this.instanceId;
        void this.publishToRedis(envelope);
        this.dispatchLocally(eventType, envelope);
        return envelope;
    }
}
export const eventBus = new EventBus();
export { EVENT_TYPES };

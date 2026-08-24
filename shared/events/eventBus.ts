import { randomUUID } from 'node:crypto';
import { createClient, RedisClientType } from 'redis';
import { buildEnvelope, EVENT_TYPES } from './event-contract.js';

export type EventHandler = (envelope: ReturnType<typeof buildEnvelope>) => void;

class EventBus {
  private subscribers = new Map<string, Set<EventHandler>>();
  private redisPub?: RedisClientType;
  private redisSub?: RedisClientType;
  private redisSubscribedEvents = new Set<string>();
  private readonly instanceId = randomUUID();
  private redisReady = false;

  constructor() {
    void this.initializeRedis();
  }

  private async initializeRedis() {
    const redisUrl = process.env.REDIS_URL || (process.env.REDIS_HOST ? `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}` : '');
    if (!redisUrl) {
      return;
    }

    try {
      const pub = createClient({ url: redisUrl });
      const sub = createClient({ url: redisUrl });

      pub.on('error', (err: unknown) => console.error('[eventBus] Redis pub error', err));
      sub.on('error', (err: unknown) => console.error('[eventBus] Redis sub error', err));

      await Promise.all([pub.connect(), sub.connect()]);

      this.redisPub = pub;
      this.redisSub = sub;
      this.redisReady = true;
      console.log('[eventBus] connected to Redis at', redisUrl);

      for (const eventType of this.redisSubscribedEvents) {
        void this.subscribeRedisTopic(eventType);
      }
    } catch (err) {
      console.warn('[eventBus] Redis connection failed, falling back to local event bus', err);
    }
  }

  private dispatchLocally(eventType: string, envelope: ReturnType<typeof buildEnvelope>) {
    const handlers = this.subscribers.get(eventType) ?? new Set<EventHandler>();
    handlers.forEach((handler) => handler(envelope));
  }

  private async subscribeRedisTopic(eventType: string) {
    if (!this.redisSub) {
      return;
    }

    try {
      await this.redisSub.subscribe(eventType, (message: string) => {
        try {
          const envelope = JSON.parse(message) as ReturnType<typeof buildEnvelope> & { source?: string };
          if (envelope.source === this.instanceId) {
            return;
          }
          this.dispatchLocally(eventType, envelope);
        } catch (err: unknown) {
          console.error('[eventBus] failed to parse Redis event', err);
        }
      });
    } catch (err: unknown) {
      console.error('[eventBus] Redis subscribe failed', err);
    }
  }

  private async publishToRedis(envelope: ReturnType<typeof buildEnvelope>) {
    if (!this.redisPub) {
      return;
    }

    try {
      await this.redisPub.publish(envelope.eventType, JSON.stringify(envelope));
    } catch (err) {
      console.error('[eventBus] publish to Redis failed', err);
    }
  }

  subscribe(eventType: string, handler: EventHandler) {
    const handlers = this.subscribers.get(eventType) ?? new Set<EventHandler>();
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
          void this.redisSub.unsubscribe(eventType).catch((err: unknown) => console.error('[eventBus] Redis unsubscribe failed', err));
          this.redisSubscribedEvents.delete(eventType);
        }
      }
    };
  }

  publish(eventType: string, data: unknown, correlationId = randomUUID()) {
    const envelope = buildEnvelope(eventType, data, correlationId) as ReturnType<typeof buildEnvelope> & { source: string };
    envelope.source = this.instanceId;
    void this.publishToRedis(envelope);
    this.dispatchLocally(eventType, envelope);
    return envelope;
  }
}

export const eventBus = new EventBus();
export { EVENT_TYPES };

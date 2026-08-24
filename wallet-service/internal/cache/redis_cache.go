package cache

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/redis/go-redis/v9"
)

type RedisCache struct {
	client *redis.Client
}

func NewRedisCache(redisURL string) (*RedisCache, error) {
	client, err := newRedisClient(redisURL)
	if err != nil {
		return nil, err
	}

	return &RedisCache{client: client}, nil
}

func (c *RedisCache) Set(key string, value any) {
	payload, err := json.Marshal(value)
	if err != nil {
		fmt.Printf("[redis cache] failed to marshal value: %v\n", err)
		return
	}

	if err := c.client.Set(context.Background(), key, payload, 0).Err(); err != nil {
		fmt.Printf("[redis cache] failed to set key %s: %v\n", key, err)
	}
}

func (c *RedisCache) Get(key string) (any, bool) {
	result, err := c.client.Get(context.Background(), key).Bytes()
	if err != nil {
		return nil, false
	}

	var value any
	if err := json.Unmarshal(result, &value); err != nil {
		fmt.Printf("[redis cache] failed to unmarshal key %s: %v\n", key, err)
		return nil, false
	}

	return value, true
}

func newRedisClient(redisURL string) (*redis.Client, error) {
	options, err := redis.ParseURL(redisURL)
	if err != nil {
		return nil, fmt.Errorf("invalid redis url: %w", err)
	}

	client := redis.NewClient(options)
	if err := client.Ping(context.Background()).Err(); err != nil {
		return nil, fmt.Errorf("redis ping failed: %w", err)
	}

	return client, nil
}

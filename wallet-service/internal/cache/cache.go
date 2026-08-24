package cache

type Cache interface {
	Set(key string, value any)
	Get(key string) (any, bool)
}

type InMemoryCache struct {
	data map[string]any
}

func NewInMemoryCache() *InMemoryCache {
	return &InMemoryCache{data: map[string]any{}}
}

func (c *InMemoryCache) Set(key string, value any) {
	c.data[key] = value
}

func (c *InMemoryCache) Get(key string) (any, bool) {
	value, ok := c.data[key]
	return value, ok
}

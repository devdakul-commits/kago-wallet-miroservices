package db

type Store interface {
	Save(key string, value any)
	Load(key string) (any, bool)
}

type InMemoryStore struct {
	data map[string]any
}

func NewInMemoryStore() *InMemoryStore {
	return &InMemoryStore{data: map[string]any{}}
}

func (s *InMemoryStore) Save(key string, value any) {
	s.data[key] = value
}

func (s *InMemoryStore) Load(key string) (any, bool) {
	value, ok := s.data[key]
	return value, ok
}

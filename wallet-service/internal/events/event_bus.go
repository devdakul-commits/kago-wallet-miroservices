package events

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

type Envelope struct {
	EventID       string      `json:"eventId"`
	EventType     string      `json:"eventType"`
	OccurredAt    string      `json:"occurredAt"`
	CorrelationID string      `json:"correlationId"`
	Source        string      `json:"source"`
	Data          interface{} `json:"data"`
}

type EventHandler func(envelope Envelope)

type EventBus struct {
	publisher     *redis.Client
	subscriber    *redis.Client
	handlers      map[string][]EventHandler
	subscriptions map[string]struct{}
	sourceID      string
	ctx           context.Context
	cancel        context.CancelFunc
	mu            sync.RWMutex
}

func NewEventBus(redisURL string) (*EventBus, error) {
	ctx, cancel := context.WithCancel(context.Background())
	bus := &EventBus{
		handlers:      make(map[string][]EventHandler),
		subscriptions: make(map[string]struct{}),
		sourceID:      uuid.NewString(),
		ctx:           ctx,
		cancel:        cancel,
	}

	if redisURL == "" {
		return bus, nil
	}

	options, err := redis.ParseURL(redisURL)
	if err != nil {
		cancel()
		return nil, fmt.Errorf("invalid redis url: %w", err)
	}

	publisher := redis.NewClient(options)
	subscriber := redis.NewClient(options)

	if err := publisher.Ping(ctx).Err(); err != nil {
		cancel()
		return nil, fmt.Errorf("redis publisher ping failed: %w", err)
	}

	if err := subscriber.Ping(ctx).Err(); err != nil {
		cancel()
		return nil, fmt.Errorf("redis subscriber ping failed: %w", err)
	}

	bus.publisher = publisher
	bus.subscriber = subscriber

	return bus, nil
}

func (b *EventBus) Publish(eventType string, data any) {
	envelope := Envelope{
		EventID:       uuid.NewString(),
		EventType:     eventType,
		OccurredAt:    time.Now().UTC().Format(time.RFC3339),
		CorrelationID: uuid.NewString(),
		Source:        b.sourceID,
		Data:          data,
	}

	b.dispatch(eventType, envelope)

	if b.publisher != nil {
		payload, err := json.Marshal(envelope)
		if err != nil {
			fmt.Printf("[event bus] serialize failed: %v\n", err)
			return
		}
		if err := b.publisher.Publish(b.ctx, eventType, payload).Err(); err != nil {
			fmt.Printf("[event bus] publish failed: %v\n", err)
		}
	}
}

func (b *EventBus) Subscribe(eventType string, handler EventHandler) error {
	b.mu.Lock()
	b.handlers[eventType] = append(b.handlers[eventType], handler)
	first := len(b.handlers[eventType]) == 1
	b.subscriptions[eventType] = struct{}{}
	b.mu.Unlock()

	if first && b.subscriber != nil {
		return b.startRedisSubscription(eventType)
	}

	return nil
}

func (b *EventBus) dispatch(eventType string, envelope Envelope) {
	b.mu.RLock()
	handlers := append([]EventHandler(nil), b.handlers[eventType]...)
	b.mu.RUnlock()

	for _, handler := range handlers {
		handler(envelope)
	}
}

func (b *EventBus) startRedisSubscription(eventType string) error {
	pubsub := b.subscriber.Subscribe(b.ctx, eventType)
	_, err := pubsub.Receive(b.ctx)
	if err != nil {
		return err
	}

	go func() {
		ch := pubsub.Channel()
		for {
			select {
			case <-b.ctx.Done():
				return
			case msg, ok := <-ch:
				if !ok {
					return
				}
				var envelope Envelope
				if err := json.Unmarshal([]byte(msg.Payload), &envelope); err != nil {
					fmt.Printf("[event bus] failed to unmarshal event: %v\n", err)
					continue
				}
				if envelope.Source == b.sourceID {
					continue
				}
				b.dispatch(eventType, envelope)
			}
		}
	}()

	return nil
}

func (b *EventBus) Close() error {
	b.cancel()
	if b.publisher != nil {
		_ = b.publisher.Close()
	}
	if b.subscriber != nil {
		_ = b.subscriber.Close()
	}
	return nil
}

var defaultBus *EventBus

func Initialize(redisURL string) error {
	bus, err := NewEventBus(redisURL)
	if err != nil {
		return err
	}
	defaultBus = bus
	return nil
}

func Publish(eventType string, data any) {
	if defaultBus == nil {
		return
	}
	defaultBus.Publish(eventType, data)
}

func Subscribe(eventType string, handler EventHandler) error {
	if defaultBus == nil {
		return fmt.Errorf("event bus not initialized")
	}
	return defaultBus.Subscribe(eventType, handler)
}

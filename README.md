# Kago Wallet Microservices

This workspace now contains Go-based wallet and payment services with repository, service, cache, and db abstractions.

## Services
- Wallet Service: Go
- Payment Service: Go
- Gateway: The legacy backend forwards wallet and payment traffic to these services.

## Architecture
- Keep each service independently deployable.
- Keep business logic out of the handlers and inside service/repository layers.
- Use in-memory implementations for local development and tests while the persistence layer is migrated incrementally.

## Current implementation
- Wallet service handles wallet creation, funding, and lookup through a service layer backed by an in-memory repository.
- Payment service handles payment authorization and wallet action routing through a dedicated service layer.
- The gateway continues to proxy relevant routes to the new services.




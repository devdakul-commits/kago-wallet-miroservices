# Reward Service

A Node.js/TypeScript microservice for reward check-in flows.

## Endpoints
- `GET /health`
- `GET /user/reward/daily/status/:firebase_uid`
- `POST /user/reward/daily/checkin/:firebase_uid`
- `GET /reward/daily/history/:firebase_uid`

## Run
```bash
cd kago-wallet-microservices/reward-service
npm install
npm run build
npm start
```

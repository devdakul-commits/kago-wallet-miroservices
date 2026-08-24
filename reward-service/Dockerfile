FROM node:20-alpine
WORKDIR /usr/src/app/reward-service
COPY reward-service/package*.json ./
COPY reward-service/tsconfig.json ./
COPY reward-service/server.ts ./
COPY reward-service/src ./src
COPY shared ./shared
RUN npm install
RUN npm run build
EXPOSE 3015
CMD ["node", "dist/server.js"]

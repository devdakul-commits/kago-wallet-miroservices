FROM node:20-alpine
WORKDIR /usr/src/app/notification-service
COPY notification-service/package*.json ./
COPY notification-service/tsconfig.json ./
COPY notification-service/server.ts ./
COPY notification-service/src ./src
COPY shared ./shared
RUN npm install
RUN npm run build
EXPOSE 3003
CMD ["node", "dist/server.js"]

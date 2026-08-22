FROM node:20-alpine
WORKDIR /usr/src/app/chat-service
COPY chat-service/package*.json ./
COPY chat-service/tsconfig.json ./
COPY chat-service/server.ts ./
COPY chat-service/src ./src
COPY shared ./shared
RUN npm install
RUN npm run build
EXPOSE 3010
CMD ["node", "dist/server.js"]

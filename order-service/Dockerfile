FROM node:20-alpine
WORKDIR /usr/src/app/order-service
COPY order-service/package*.json ./
COPY order-service/tsconfig.json ./
COPY order-service/server.ts ./
COPY order-service/src ./src
COPY shared ./shared
RUN npm install
RUN npm run build
EXPOSE 3002
CMD ["node", "dist/server.js"]

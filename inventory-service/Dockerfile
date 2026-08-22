FROM node:20-alpine
WORKDIR /usr/src/app/inventory-service
COPY inventory-service/package*.json ./
COPY inventory-service/tsconfig.json ./
COPY inventory-service/server.ts ./
COPY inventory-service/src ./src
COPY shared ./shared
RUN npm install
RUN npm run build
EXPOSE 3006
CMD ["node", "dist/server.js"]

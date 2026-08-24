FROM node:20-alpine
WORKDIR /usr/src/app/support-service
COPY support-service/package*.json ./
COPY support-service/tsconfig.json ./
COPY support-service/server.ts ./
COPY support-service/src ./src
COPY shared ./shared
RUN npm install
RUN npm run build
EXPOSE 3020
CMD ["node", "dist/server.js"]

FROM node:20-alpine
WORKDIR /usr/src/app/auth-service
COPY auth-service/package*.json ./
COPY auth-service/tsconfig.json ./
COPY auth-service/server.ts ./
COPY auth-service/src ./src
COPY auth-service/admin ./admin
COPY shared ./shared
RUN npm install
RUN npm run build
EXPOSE 3001
CMD ["node", "dist/server.js"]

FROM node:20-alpine
WORKDIR /usr/src/app/menu-service
COPY menu-service/package*.json ./
COPY menu-service/tsconfig.json ./
COPY menu-service/server.ts ./
COPY menu-service/src ./src
COPY shared ./shared
RUN npm install
RUN npm run build
EXPOSE 3007
CMD ["node", "dist/server.js"]

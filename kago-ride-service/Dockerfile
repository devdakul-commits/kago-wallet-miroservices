FROM node:20-alpine
WORKDIR /usr/src/app/kago-ride-service
COPY kago-ride-service/package*.json ./
COPY kago-ride-service/tsconfig.json ./
COPY kago-ride-service/server.ts ./
COPY kago-ride-service/src ./src
COPY shared ./shared
RUN npm install
RUN npm run build
EXPOSE 3016
CMD ["node", "dist/server.js"]

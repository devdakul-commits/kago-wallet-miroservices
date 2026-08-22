FROM node:20-alpine
WORKDIR /usr/src/app/kago-settings-service
COPY kago-settings-service/package*.json ./
COPY kago-settings-service/tsconfig.json ./
COPY kago-settings-service/server.ts ./
COPY kago-settings-service/src ./src
COPY shared ./shared
RUN npm install
RUN npm run build
EXPOSE 3017
CMD ["node", "dist/server.js"]

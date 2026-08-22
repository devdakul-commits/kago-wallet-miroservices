FROM node:20-alpine
WORKDIR /usr/src/app/kago-laundry-service-user
COPY kago-laundry-service/user/package*.json ./
COPY kago-laundry-service/user/tsconfig.json ./
COPY kago-laundry-service/user/server.ts ./
COPY kago-laundry-service/user/src ./src
COPY shared ./shared
RUN npm install
RUN npm run build
EXPOSE 3012
CMD ["node", "dist/server.js"]

FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY shared/package.json ./shared/

RUN npm ci

COPY . .

RUN npx prisma generate --schema=server/prisma/schema.prisma
ENV VITE_API_URL=https://erp.shadowlabz.in/api
ENV VITE_FIREBASE_API_KEY=AIzaSyC5O7vfKD9_6CSotCgTS90eGTI6pkkKn30
ENV VITE_FIREBASE_AUTH_DOMAIN=kapda-pos.firebaseapp.com
ENV VITE_FIREBASE_PROJECT_ID=kapda-pos
ENV VITE_FIREBASE_STORAGE_BUCKET=kapda-pos.firebasestorage.app
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=480698461785
ENV VITE_FIREBASE_APP_ID=1:480698461785:web:51bfad7f1b4973fb5b0b48
RUN npm run build -w client

EXPOSE 8080
CMD npx prisma db push --schema=server/prisma/schema.prisma --accept-data-loss && npx tsx server/prisma/seed-roles.ts && npx tsx server/src/index.ts

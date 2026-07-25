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

EXPOSE 3000
CMD npx prisma db push --schema=server/prisma/schema.prisma --accept-data-loss && npx tsx server/src/index.ts

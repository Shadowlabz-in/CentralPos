# Multi-stage build
FROM node:20-alpine AS base
RUN npm i -g pnpm

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY server/package.json ./server/
COPY client/package.json ./client/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

# Build shared package
FROM base AS build-shared
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY packages/shared ./packages/shared
WORKDIR /app/packages/shared
RUN pnpm build

# Build server
FROM base AS build-server
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY server ./server
COPY packages/shared ./packages/shared
COPY --from=build-shared /app/packages/shared/dist ./packages/shared/dist
COPY tsconfig.base.json ./
WORKDIR /app/server
RUN npx prisma generate
RUN pnpm build

# Build client
FROM base AS build-client
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY client ./client
COPY packages/shared ./packages/shared
COPY --from=build-shared /app/packages/shared/dist ./packages/shared/dist
WORKDIR /app/client
RUN pnpm build

# Server runtime
FROM node:20-alpine AS server
WORKDIR /app
RUN npm i -g pnpm
RUN apk add --no-cache postgresql-client
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build-server /app/server/dist ./server/dist
COPY server/package.json ./server/
COPY server/prisma ./server/prisma
COPY --from=build-shared /app/packages/shared/dist ./packages/shared/dist
COPY packages/shared/package.json ./packages/shared/
EXPOSE 4000
CMD ["node", "server/dist/index.js"]

# Client runtime (nginx)
FROM nginx:alpine AS client
COPY --from=build-client /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

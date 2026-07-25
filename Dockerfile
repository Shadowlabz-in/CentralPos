FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY shared/package.json ./shared/
RUN npm ci

FROM deps AS build
COPY . .
RUN cd shared && npx tsc
RUN cd server && npx tsc

FROM base AS runner
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/shared/dist ./shared/dist
COPY --from=build /app/shared/package.json ./shared/
COPY --from=build /app/server/package.json ./server/
COPY --from=build /app/package.json ./

EXPOSE 3000
CMD ["node", "server/dist/index.js"]

# Simplification trade-off: the runtime stage copies the full node_modules
# (including devDependencies) built in the compile stage rather than doing a
# separate `npm ci --omit=dev` + selective Prisma-client copy. This keeps the
# Prisma-generated client guaranteed to match, and keeps the `prisma` CLI
# available for `prisma migrate deploy` at container start, at the cost of a
# larger image — an acceptable trade-off for this app's scope.

FROM node:22-alpine AS builder
WORKDIR /app

# Optional build-time proxy support for restricted/corporate networks.
ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG NO_PROXY
ENV HTTP_PROXY=$HTTP_PROXY
ENV HTTPS_PROXY=$HTTPS_PROXY
ENV NO_PROXY=$NO_PROXY
# Some corporate proxies perform TLS interception with an internal CA that
# isn't trusted inside the build container; only needed for the Prisma
# engine download during `prisma generate`, not at runtime.
ARG NODE_TLS_REJECT_UNAUTHORIZED=1
ENV NODE_TLS_REJECT_UNAUTHORIZED=$NODE_TLS_REJECT_UNAUTHORIZED

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]

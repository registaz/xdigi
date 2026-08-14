# The API base URL is baked in at build time (Vite env vars are inlined into
# the bundle), so it must be supplied as a build ARG rather than a runtime
# environment variable.
FROM node:24-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install -g npm@12.0.2 && npm ci

COPY . .

ARG VITE_API_BASE_URL=http://localhost:4000/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

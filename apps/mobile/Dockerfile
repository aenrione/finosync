# Production Dockerfile for Coolify deployment (Expo web static export)
# Build context must be the MONOREPO ROOT (not apps/mobile/)
#
# docker build -f apps/mobile/Dockerfile -t finosync-mobile .
# docker run -d -p 3000:3000 finosync-mobile

# ---- Build ----
FROM node:22-alpine AS build
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy all files needed for install and build
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages packages
COPY apps/mobile apps/mobile

# Use hoisted node_modules so Metro/Babel can resolve all dependencies
RUN echo "node-linker=hoisted" > .npmrc && pnpm install --no-frozen-lockfile

# Set env vars for the build (baked into the static bundle)
ARG EXPO_PUBLIC_API_URL
ARG EXPO_PUBLIC_ENV=production
ARG EXPO_PUBLIC_FINTOC_PUBLIC_KEY
ARG EXPO_PUBLIC_ENABLE_BIOMETRIC_AUTH=false

ENV EXPO_PUBLIC_API_URL=${EXPO_PUBLIC_API_URL} \
    EXPO_PUBLIC_ENV=${EXPO_PUBLIC_ENV} \
    EXPO_PUBLIC_FINTOC_PUBLIC_KEY=${EXPO_PUBLIC_FINTOC_PUBLIC_KEY} \
    EXPO_PUBLIC_ENABLE_BIOMETRIC_AUTH=${EXPO_PUBLIC_ENABLE_BIOMETRIC_AUTH}

WORKDIR /app/apps/mobile
RUN /app/node_modules/.bin/expo export --platform web

# ---- Serve ----
FROM nginx:alpine

COPY apps/mobile/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/mobile/dist /usr/share/nginx/html

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]

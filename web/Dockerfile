# Build stage
FROM node:24-alpine AS build

WORKDIR /app

COPY . .

# Install dependencies
RUN npm ci

## Set PUBLIC_URL for React router
#ENV PUBLIC_URL=/ui

# Build the app
RUN npm run build

# Production stage
FROM bitnami/nginx:1.29

COPY nginx_server_block.conf /opt/bitnami/nginx/conf/server_blocks/nginx_server_block.conf
# Copy built files from build stage
COPY --from=build /app/build /app/

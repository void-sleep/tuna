# Build stage
FROM node:24-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

# Production stage
FROM nginxinc/nginx-unprivileged:1.28-alpine
# Copy built files from build/ui to html/ui directory
COPY --from=build /app/build/ui /usr/share/nginx/html/ui
# Copy custom nginx configuration (adds to conf.d, doesn't replace default.conf)
COPY nginx.conf /etc/nginx/conf.d/app.conf
# Expose ports
EXPOSE 8080 8081
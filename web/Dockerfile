# Build stage
FROM node:22-alpine AS build
WORKDIR /app
COPY . .
# Install dependencies
RUN npm ci
# Build the app
RUN npm run build

# Production stage
FROM nginx:1.29-alpine
# Copy built files from build stage
COPY --from=build /app/build /usr/share/nginx/html
#EXPOSE 80
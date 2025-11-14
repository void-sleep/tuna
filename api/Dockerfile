# Build stage with GraalVM
FROM ghcr.io/graalvm/native-image-community:21-muslib AS build

WORKDIR /app

# Install Maven
RUN microdnf install -y findutils

COPY . .

# Make mvnw executable
RUN chmod +x mvnw

# Build native image
RUN ./mvnw -Pnative native:compile -DskipTests

# Runtime stage - use minimal base image
FROM gcr.io/distroless/cc-debian12:nonroot

WORKDIR /app

# Copy the native executable
COPY --from=build /app/target/api /app/api

# Expose ports
EXPOSE 8080 8081

# Run the native executable
ENTRYPOINT ["/app/api"]
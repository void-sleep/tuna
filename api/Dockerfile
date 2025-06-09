FROM bellsoft/liberica-openjdk-alpine:24 AS build

WORKDIR /app

COPY . .
# Make mvnw executable
RUN chmod +x mvnw

# Build the application
RUN ./mvnw package -DskipTests

# Runtime stage
FROM bellsoft/liberica-openjdk-alpine:24

WORKDIR /app

# Copy the built jar file
COPY --from=build /app/target/*.jar app.jar

# Use JDK_JAVA_OPTIONS as default env

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]

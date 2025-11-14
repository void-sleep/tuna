#  see: https://docs.spring.io/spring-boot/reference/packaging/container-images/dockerfiles.html
# First stage: build the Spring Boot jar
FROM maven:3.9.11-eclipse-temurin-25 AS build
WORKDIR /builder
COPY . .
RUN mvn clean package -DskipTests

# Second stage: extract the jar layers and prepare CDS
FROM bellsoft/liberica-openjre-debian:25-cds AS builder
WORKDIR /builder
COPY --from=build /builder/target/*.jar application.jar
RUN java -Djarmode=tools -jar application.jar extract --layers --destination extracted

# Final runtime stage
FROM bellsoft/liberica-openjre-debian:25-cds

WORKDIR /application

# Copy the extracted layers into the runtime image
COPY --from=builder /builder/extracted/dependencies/ ./
COPY --from=builder /builder/extracted/spring-boot-loader/ ./
COPY --from=builder /builder/extracted/snapshot-dependencies/ ./
COPY --from=builder /builder/extracted/application/ ./

# Copy the lightweight application jar for runtime
COPY --from=builder /builder/application.jar ./application.jar

# Generate the CDS archive to improve startup time
# RUN java -XX:ArchiveClassesAtExit=application.jsa -Dspring.context.exit=onRefresh -jar application.jar

# Expose application ports
EXPOSE 8080 8081

# Run the application with the prod profile
ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-jar", "application.jar"]
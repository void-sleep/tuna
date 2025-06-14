package com.voidsleep.tuna.config;

import com.voidsleep.tuna.filter.KeycloakDebugTokenHeaderFilter;
import com.voidsleep.tuna.service.KeycloakService;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.oauth2.jwt.JwtDecoder;

@Configuration
public class KeycloakDebugConfiguration {

  private final KeycloakProperties properties;

  public KeycloakDebugConfiguration(KeycloakProperties properties) {
    this.properties = properties;
  }

  private Keycloak keycloakClient(KeycloakProperties properties, String grantType) {
    return KeycloakBuilder.builder()
      .serverUrl(properties.getServerUrl())
      .realm(properties.getRealm())
      .username(properties.getUsername())
      .password(properties.getPassword())
      .clientId(properties.getClientId())
      .clientSecret(properties.getClientSecret())
      .grantType(grantType)
      .build();
  }

  @Bean
  @Profile("dev")
  public KeycloakDebugTokenHeaderFilter keycloakDebugTokenHeaderFilter(JwtDecoder jwtDecoder) {
    return new KeycloakDebugTokenHeaderFilter(keycloakDebugService(), jwtDecoder);
  }

  @Bean(destroyMethod = "close")
  public KeycloakService keycloakService() {
    Keycloak keycloak = keycloakClient(properties, OAuth2Constants.CLIENT_CREDENTIALS);
    return new KeycloakService(keycloak, properties);
  }

  private KeycloakService keycloakDebugService() {
    Keycloak keycloak = keycloakClient(properties, OAuth2Constants.PASSWORD);
    return new KeycloakService(keycloak, properties);
  }

}

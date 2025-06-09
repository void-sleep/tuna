package com.voidsleep.tuna.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.NestedConfigurationProperty;

import lombok.Data;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "tuna.api")
public class TunaProperties {

  @NestedConfigurationProperty
  private KeycloakProperties keycloak = new KeycloakProperties();

  @Data
  public static class KeycloakProperties {
    private String serverUrl;
    private String realm;
    private String clientId;
    private String clientSecret;
  }
}

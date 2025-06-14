package com.voidsleep.tuna.service;

import com.voidsleep.tuna.config.KeycloakProperties;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;

import java.util.Objects;

@Slf4j
public class KeycloakService implements AutoCloseable {

  private final Keycloak keycloak;
  private final KeycloakProperties properties;

  public KeycloakService(Keycloak keycloak, KeycloakProperties properties) {
    this.keycloak = keycloak;
    this.properties = properties;
  }

  private RealmResource realmResource() {
    return keycloak.realm(properties.getRealm());
  }

  public String grantAccessToken() {
    try {
      return keycloak.tokenManager().getAccessTokenString();
    } catch (Exception e) {
      log.error("grant AccessToken failed, please check username and password", e);
      return null;
    }
  }
  
  @Override
  public void close() {
    try {
      if (Objects.nonNull(keycloak)) {
        keycloak.close();
      }
    } catch (Exception ignore) {
    }
  }
  
}

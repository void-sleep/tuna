package com.voidsleep.tuna.oauth2;

import com.voidsleep.tuna.utils.KeycloakUtils;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;

/**
 * Get the token from header
 */
public class MultivaluedBearerTokenResolver implements BearerTokenResolver {
  @Override
  public String resolve(HttpServletRequest request) {
    return KeycloakUtils.firstNotBlank(KeycloakUtils.ACCESS_TOKEN_HEADERS, request::getHeader);
  }
}

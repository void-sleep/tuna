package com.voidsleep.tuna.filter;

import com.voidsleep.tuna.config.KeycloakProperties;
import com.voidsleep.tuna.utils.KeycloakUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.adapters.authorization.integration.jakarta.ServletPolicyEnforcerFilter;
import org.keycloak.adapters.authorization.spi.ConfigurationResolver;
import org.springframework.http.server.PathContainer;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.pattern.PathPatternParser;

import java.io.IOException;
import java.util.stream.Stream;

/**
 * 重写改变获取Token的Header值
 */
@Slf4j
public class KeycloakServletPolicyEnforcerFilter extends OncePerRequestFilter {
  private static final PathPatternParser matcher = PathPatternParser.defaultInstance;
  private final KeycloakProperties properties;
  private final ServletPolicyEnforcerFilter keycloakPolicyEnforcerFilter;

  public KeycloakServletPolicyEnforcerFilter(ConfigurationResolver configResolver, KeycloakProperties properties) {
    this.properties = properties;
    keycloakPolicyEnforcerFilter = new ServletPolicyEnforcerFilterWrapper(configResolver);
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
    log.debug("do keycloak PolicyEnforcerFilter: {}", request.getServletPath());
    keycloakPolicyEnforcerFilter.doFilter(request, response, filterChain);
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
    return !properties.getPolicyEnforcer().isEnabled() || isIgnore(request.getServletPath());
  }

  private boolean isIgnore(String path) {
    return Stream.of(properties.getPolicyEnforcer().getIgnores().stream(),
        properties.getPermitAll().stream())
      .flatMap(s -> s)
      .anyMatch(pattern -> matcher.parse(pattern).matches(PathContainer.parsePath(path)));
  }

  public static class ServletPolicyEnforcerFilterWrapper extends ServletPolicyEnforcerFilter {
    public ServletPolicyEnforcerFilterWrapper(ConfigurationResolver configResolver) {
      super(configResolver);
    }

    @Override
    protected String extractBearerToken(HttpServletRequest request) {
      return KeycloakUtils.firstNotBlank(KeycloakUtils.ACCESS_TOKEN_HEADERS, request::getHeader);
    }
  }

}
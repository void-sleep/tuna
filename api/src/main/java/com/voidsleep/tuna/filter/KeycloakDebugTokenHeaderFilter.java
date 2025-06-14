package com.voidsleep.tuna.filter;

import com.voidsleep.tuna.oauth2.DetailJwtAuthenticationConverter;
import com.voidsleep.tuna.service.KeycloakService;
import com.voidsleep.tuna.utils.KeycloakUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
public class KeycloakDebugTokenHeaderFilter extends OncePerRequestFilter {

  private final KeycloakService keycloakService;
  private final JwtDecoder jwtDecoder;

  public KeycloakDebugTokenHeaderFilter(KeycloakService keycloakService, JwtDecoder jwtDecoder) {
    this.keycloakService = keycloakService;
    this.jwtDecoder = jwtDecoder;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
    String token = keycloakService.grantAccessToken();
    if (StringUtils.isBlank(token)) {
      log.error("debug token is blank, please check your debug username and password");
      filterChain.doFilter(request, response);
      return;
    }
    AddHeaderHttpServletRequest wrapper = new AddHeaderHttpServletRequest(request);
    wrapper.addHeader(KeycloakUtils.ACCESS_TOKEN_HEADERS.getFirst(), token);
    Jwt jwt = jwtDecoder.decode(token);
    wrapper.addHeader(KeycloakUtils.ID_HEADERS.getFirst(), jwt.getClaimAsString(DetailJwtAuthenticationConverter.CLAIM_SUB));
    wrapper.addHeader(KeycloakUtils.USERNAME_HEADERS.getFirst(), jwt.getClaimAsString(DetailJwtAuthenticationConverter.CLAIM_USERNAME));
    filterChain.doFilter(wrapper, response);
  }

  @Override
  public void destroy() {
    keycloakService.close();
  }
}

package com.voidsleep.tuna.config;

import com.voidsleep.tuna.filter.KeycloakDebugTokenHeaderFilter;
import com.voidsleep.tuna.filter.KeycloakServletPolicyEnforcerFilter;
import com.voidsleep.tuna.oauth2.DetailJwtAuthenticationConverter;
import com.voidsleep.tuna.oauth2.MultivaluedBearerTokenResolver;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.keycloak.adapters.authorization.spi.ConfigurationResolver;
import org.keycloak.representations.adapters.config.PolicyEnforcerConfig;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.cache.concurrent.ConcurrentMapCache;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.AuthorizeHttpRequestsConfigurer;
import org.springframework.security.config.annotation.web.configurers.oauth2.server.resource.OAuth2ResourceServerConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.firewall.StrictHttpFirewall;

import java.util.Map;

@Slf4j
@Configuration
public class OAuth2SecurityConfiguration {

  private final KeycloakProperties properties;

  public OAuth2SecurityConfiguration(KeycloakProperties properties) {
    this.properties = properties;
  }

  @Bean
  @ConditionalOnMissingBean
  @ConditionalOnClass(StrictHttpFirewall.class)
  public StrictHttpFirewall httpFirewall() {
    StrictHttpFirewall firewall = new StrictHttpFirewall();
    // 允许header中包含中文
    firewall.setAllowedHeaderValues((e) -> true);
    return firewall;
  }

  @Bean
  public KeycloakServletPolicyEnforcerFilter keycloakServletPolicyEnforcerFilter() {
    return new KeycloakServletPolicyEnforcerFilter(configurationResolver(), properties);
  }

  private ConfigurationResolver configurationResolver() {
    return request -> {
      PolicyEnforcerConfig config = new PolicyEnforcerConfig();
      config.setRealm(properties.getRealm());
      config.setAuthServerUrl(properties.getServerUrl());
      KeycloakProperties.PolicyEnforcer enforcer = properties.getPolicyEnforcer();
      config.setEnforcementMode(enforcer.getEnforcementMode());
      config.setHttpMethodAsScope(enforcer.isHttpMethodAsScope());
      if (StringUtils.isNotBlank(enforcer.getClientId()) && StringUtils.isNotBlank(enforcer.getClientSecret())) {
        config.setResource(enforcer.getClientId());
        config.setCredentials(Map.of("secret", enforcer.getClientSecret()));
      } else {
        config.setResource(properties.getClientId());
        config.setCredentials(Map.of("secret", properties.getClientSecret()));
      }
      return config;
    };
  }

  @Bean
  public Converter<Jwt, AbstractAuthenticationToken> detailJwtAuthenticationConverter() {
    return new DetailJwtAuthenticationConverter();
  }

  @Bean
  public JwtDecoder oauth2SecurityJwtDecoder() {
    return oauth2SecurityJwtDecoder(properties);
  }

  @Bean
  public BearerTokenResolver multivaluedBearerTokenResolver() {
    return new MultivaluedBearerTokenResolver();
  }

  @Bean
  public Customizer<OAuth2ResourceServerConfigurer<HttpSecurity>> oauth2ResourceServerCustomizer(
    JwtDecoder jwtDecoder,
    Converter<Jwt, AbstractAuthenticationToken> converter) {
    return server -> server.jwt((jwt) ->
      jwt.decoder(jwtDecoder).jwtAuthenticationConverter(converter)
    );
  }

  @Bean
  public Customizer<AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry> authorizeHttpRequestsCustomizer() {
    return requests -> {
      //      requests.requestMatchers(security.getAnonymous().toArray(new String[0])).anonymous();
      //      requests.requestMatchers(permitAll).permitAll();
      requests.anyRequest().authenticated();
    };
  }

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                 ObjectProvider<KeycloakDebugTokenHeaderFilter> debugFilter,
                                                 KeycloakServletPolicyEnforcerFilter policyEnforcer,
                                                 Customizer<AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry> authorizeHttpRequestsCustomizer,
                                                 Customizer<OAuth2ResourceServerConfigurer<HttpSecurity>> resourceServerCustomizer) throws Exception {
    http.authorizeHttpRequests(authorizeHttpRequestsCustomizer);
//    http.exceptionHandling(oauth2ExceptionHandlingCustomizer);
    http.oauth2ResourceServer(resourceServerCustomizer);

    debugFilter.ifAvailable(filter -> http.addFilterBefore(filter, BearerTokenAuthenticationFilter.class));

    http.addFilterAfter(policyEnforcer, BearerTokenAuthenticationFilter.class);
    // State-less session，我们使用 access-token
    http.sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
    // Disable CSRF because of state-less session-management
    http.csrf(AbstractHttpConfigurer::disable);
    return http.build();
  }

  private JwtDecoder oauth2SecurityJwtDecoder(KeycloakProperties properties) {
    return NimbusJwtDecoder.withIssuerLocation(issuerUri(properties))
      .cache(new ConcurrentMapCache("issuerUri"))
      .build();
  }

  private String issuerUri(KeycloakProperties properties) {
    String issuerUri = properties.getIssuerUri();
    if (StringUtils.isNotBlank(issuerUri)) {
      return issuerUri;
    }
    return StringUtils.removeEnd(properties.getServerUrl(), "/") + "/realms/" + properties.getRealm();
  }

}

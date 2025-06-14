package com.voidsleep.tuna.oauth2;

import com.voidsleep.tuna.entity.SecurityUserDetails;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * 从JWT中转换获取用户详细信息
 */
public class DetailJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

  /**
   * spring security 自动为 hasRole 增加的前缀
   */
  private static final String ROLE_PREFIX = "ROLE_";

  public static final String CLAIM_SUB = "sub";
  public static final String CLAIM_USERNAME = "preferred_username";

  public AbstractAuthenticationToken convert(Jwt jwt) {
    List<String> roles = allRoles(jwt);
    Collection<GrantedAuthority> authorities = convertGrantedAuthorities(roles);
    String principalClaimValue = jwt.getClaimAsString(CLAIM_SUB);
    JwtAuthenticationToken token = new JwtAuthenticationToken(jwt, authorities, principalClaimValue);
    SecurityUserDetails userDetail = new SecurityUserDetails();
    userDetail.setAuthorities(authorities);
    userDetail.setId(principalClaimValue);
    userDetail.setUsername(jwt.getClaimAsString(CLAIM_USERNAME));
    userDetail.setDisplayName(jwt.getClaimAsString("displayName"));
    userDetail.setEmail(jwt.getClaimAsString("email"));
    userDetail.setPhone(jwt.getClaimAsString("phone_number"));
    token.setDetails(userDetail);
    return token;
  }


  private List<String> allRoles(Jwt jwt) {
    return Stream.concat(realmRoles(jwt).stream(), clientRoles(jwt).stream())
      .collect(Collectors.toList());
  }

  private Collection<GrantedAuthority> convertGrantedAuthorities(List<String> allRoles) {
    return allRoles.stream()
      .map(r -> new SimpleGrantedAuthority(ROLE_PREFIX + r))
      .collect(Collectors.toList());
  }

  private List<String> clientRoles(Jwt jwt) {
    Map<String, Map<String, List<String>>> claim = jwt.getClaim("resource_access");
    return Optional.ofNullable(claim).stream().flatMap(map -> map.entrySet()
        .stream()
        .filter(e -> Objects.nonNull(e.getValue()))
        .filter(e -> Objects.nonNull(e.getValue().get("roles")))
        .flatMap(this::joinClientRole))
      .collect(Collectors.toList());
  }

  private Stream<String> joinClientRole(Map.Entry<String, Map<String, List<String>>> e) {
    return e.getValue()
      .get("roles")
      .stream()
      .map(s -> e.getKey() + ":" + s);
  }

  private List<String> realmRoles(Jwt jwt) {
    return Optional.ofNullable(jwt.<Map<String, List<String>>>getClaim("realm_access"))
      .map(e -> e.get("roles"))
      .orElse(List.of());
  }

}
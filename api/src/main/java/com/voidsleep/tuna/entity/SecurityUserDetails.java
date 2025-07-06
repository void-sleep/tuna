package com.voidsleep.tuna.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

/**
 * Spring Security UserDetails
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SecurityUserDetails extends UserDetail implements UserDetails {

  private Collection<GrantedAuthority> authorities;

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return authorities;
  }

  @Override
  public String getPassword() {
    return null;
  }

}

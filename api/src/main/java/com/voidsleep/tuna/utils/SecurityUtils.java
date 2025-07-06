package com.voidsleep.tuna.utils;

import com.voidsleep.tuna.entity.SecurityUserDetails;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Objects;

@Slf4j
public class SecurityUtils {

  public static String currentUserId() {
    return Objects.requireNonNull(currentUser()).getId();
  }

  public static SecurityUserDetails currentUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    return (SecurityUserDetails) authentication.getDetails();
  }

}

package com.voidsleep.tuna.controller;

import com.voidsleep.tuna.entity.SecurityUserDetails;
import com.voidsleep.tuna.entity.UserDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/")
public class UserInfoController {

  @GetMapping(value = "/userinfo")
  public ResponseEntity<UserDetail> userinfo() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    SecurityUserDetails details = (SecurityUserDetails) authentication.getDetails();
    UserDetail result = new UserDetail();
    // hidden sensitive info    
    result.setUsername(details.getUsername());
    result.setEmail(details.getEmail());
    result.setDisplayName(details.getDisplayName());
    result.setPhone(details.getPhone());
    return ResponseEntity.ok(result);
  }

}

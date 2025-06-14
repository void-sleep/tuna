package com.voidsleep.tuna.controller;

import com.voidsleep.tuna.entity.SecurityUserDetails;
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
  public ResponseEntity<SecurityUserDetails> userinfo() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    return ResponseEntity.ok((SecurityUserDetails) authentication.getDetails());
  }

}

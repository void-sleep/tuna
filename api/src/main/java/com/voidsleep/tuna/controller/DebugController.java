package com.voidsleep.tuna.controller;

import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.stream.Collectors;

@Profile("dev")
@RestController
@RequestMapping("/")
public class DebugController {

  @GetMapping(value = "/headers")
  public ResponseEntity<Map<String, String>> headers(@RequestHeader Map<String, String> headers) {
    return ResponseEntity.ok(headers.entrySet()
      .stream()
      .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue)));
  }

}

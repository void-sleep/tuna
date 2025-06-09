package com.voidsleep.tuna.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.web.firewall.StrictHttpFirewall;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
public class OAuth2SecurityConfiguration {

  @Bean
  @ConditionalOnMissingBean
  @ConditionalOnClass(StrictHttpFirewall.class)
  public StrictHttpFirewall httpFirewall() {
    StrictHttpFirewall firewall = new StrictHttpFirewall();
    // 允许header中包含中文
    firewall.setAllowedHeaderValues((e) -> true);
    return firewall;
  }
}

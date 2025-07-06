package com.voidsleep.tuna.config;

import lombok.Data;
import org.keycloak.representations.adapters.config.PolicyEnforcerConfig;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Data
@Configuration
@ConfigurationProperties(prefix = "tuna.api.keycloak")
public class KeycloakProperties {

  private String serverUrl;
  private String realm;
  private String clientId;
  private String clientSecret;
  private String issuerUri;

  /**
   * 是否启动本地联调模式，启动时自动生成Token，此时必须设置用户名和密码
   */
  private boolean debug = false;

  /**
   * 登录用户名，我们目前只用于本地联调
   */
  private String username;

  /**
   * 登录密码，我们目前只用于本地联调
   */
  private String password;

  private PolicyEnforcer policyEnforcer = new PolicyEnforcer();

  @Data
  public static class PolicyEnforcer {
    /**
     * 是否启用 keycloak PolicyEnforcer Filter
     */
    private boolean enabled = false;

    private boolean httpMethodAsScope = true;

    private PolicyEnforcerConfig.EnforcementMode enforcementMode = PolicyEnforcerConfig.EnforcementMode.PERMISSIVE;

    /**
     * 忽略的名单，不走 PolicyEnforcer Filter，使用 Spring PathPattern 正则匹配
     */
    private List<String> ignores = List.of();

    /**
     * 可独立配置PolicyEnforcer用的client，如果不配置用全局默认的
     */
    private String clientId;

    private String clientSecret;

  }


}
# api

Spring Boot API.

## 本地开发

本地开发需要配置以下环境变量：

### 数据库配置

| 环境变量          | 默认值                                     | 说明                   |
|---------------|-----------------------------------------|----------------------|
| `DB_URL`      | `jdbc:postgresql://localhost:5432/tuna` | PostgreSQL 数据库连接 URL |
| `DB_USERNAME` | `tuna`                                  | 数据库用户名               |
| `DB_PASSWORD` | `tuna`                                  | 数据库密码                |

### Keycloak 认证配置

| 环境变量                               | 默认值                          | 说明                            |
|------------------------------------|------------------------------|-------------------------------|
| `KEYCLOAK_SERVER_URL`              | `http://localhost:8080/auth` | Keycloak 服务器地址                |
| `KEYCLOAK_REALM`                   | `tuna`                       | Keycloak realm 名称             |
| `KEYCLOAK_CLIENT_ID`               | `tuna-api`                   | Keycloak 客户端 ID               |
| `KEYCLOAK_CLIENT_SECRET`           | `tuna`                       | Keycloak 客户端密钥                |
| `KEYCLOAK_POLICY_ENFORCER_ENABLED` | `false`                      | 是否启用策略执行器                     |
| `KEYCLOAK_DEBUG`                   | `true`                       | 是否启用 Keycloak 调试模式，自动注入 Token |
| `KEYCLOAK_DEBUG_USERNAME`          | `your username`              | 调试模式用户名                       |
| `KEYCLOAK_DEBUG_PASSWORD`          | `your password`              | 调试模式密码                        |

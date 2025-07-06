package com.voidsleep.tuna.utils;

import com.voidsleep.tuna.entity.UserDetail;
import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;

@Slf4j
@UtilityClass
public class KeycloakUtils {

  /**
   * 用户属性key：手机号
   */
  public static final String KEY_PHONE_NUMBER = "phoneNumber";

  /**
   * 用户属性key：显示的完整姓名
   */
  public static final String KEY_DISPLAY_NAME = "displayName";

  public static final List<String> ID_HEADERS = List.of("x-auth-request-user", "x-forwarded-user");

  public static final List<String> USERNAME_HEADERS = List.of("x-auth-request-preferred-username", "x-forwarded-preferred-username");

  public static final List<String> ACCESS_TOKEN_HEADERS = List.of("x-auth-request-access-token", "x-forwarded-access-token");

  /**
   * 从http header中获取 Access Token的值，只包含值
   *
   * @param headers http request headers
   * @return Access Token的值，获取不到返回null
   */
  public static String accessToken(Map<String, String> headers) {
    return firstNotBlankHeader(ACCESS_TOKEN_HEADERS, headers);
  }

  /**
   * 从http header中获取用户基本信息，只包含id、username
   *
   * @param headers http request headers
   * @return 用户基本信息，只包含id、username
   */
  public static UserDetail basicUserFromHeaders(Map<String, String> headers) {
    if (Objects.isNull(headers) || headers.isEmpty()) {
      return null;
    }
    UserDetail user = new UserDetail();
    user.setId(firstNotBlankHeader(ID_HEADERS, headers));
    user.setUsername(firstNotBlankHeader(USERNAME_HEADERS, headers));
    return user;
  }

  public static String firstNotBlankHeader(List<String> keys, Map<String, String> headers) {
    for (String key : keys) {
      String val = headers.get(key);
      if (StringUtils.isNotBlank(val)) {
        return val;
      }
    }
    return firstNotBlank(keys, headers::get);
  }

  public static String firstNotBlank(List<String> keys, Function<String, String> function) {
    for (String key : keys) {
      String val = function.apply(key);
      if (StringUtils.isNotBlank(val)) {
        return val;
      }
    }
    return null;
  }

}

package com.voidsleep.tuna.filter;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;

import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * HttpServletRequest不可变的，包装一下允许增加header
 */
public class AddHeaderHttpServletRequest extends HttpServletRequestWrapper {
  private final Map<String, String> hashMap;

  public AddHeaderHttpServletRequest(HttpServletRequest request) {
    super(request);
    hashMap = new HashMap<>();
  }

  public void addHeader(String key, String value) {
    hashMap.put(key, value);
  }

  @Override
  public String getHeader(String key) {
    String value = super.getHeader(key);
    if (value == null) {
      value = hashMap.get(key);
    }
    return value;
  }


  @Override
  public Enumeration<String> getHeaders(String key) {
    Enumeration<String> enumeration = super.getHeaders(key);
    List<String> valueList = Collections.list(enumeration);
    if (hashMap.containsKey(key)) {
      valueList.add(hashMap.get(key));
    }
    return Collections.enumeration(valueList);
  }

  @Override
  public Enumeration<String> getHeaderNames() {
    List<String> keyList = Collections.list(super.getHeaderNames());
    keyList.addAll(hashMap.keySet());
    return Collections.enumeration(keyList);
  }
}

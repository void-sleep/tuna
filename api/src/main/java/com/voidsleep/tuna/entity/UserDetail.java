package com.voidsleep.tuna.entity;

import lombok.Data;

@Data
public class UserDetail {

  /**
   * 数据库ID
   */
  private String id;

  /**
   * 用户登录时用的名字，一般是拼音、域账号等
   */
  private String username;

  /**
   * 显示用姓名全称
   */
  private String displayName;

  private String email;

  /**
   * 手机号
   */
  private String phone;

}

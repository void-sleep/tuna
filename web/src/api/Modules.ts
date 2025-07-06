export interface User {
  id: string;
  username: string;
  email?: string;
  displayName?: string;
  isAnonymous?: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
}

export interface Dataset {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  datas?: Recipe[];
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Policy {
  id: string;
  name: string;
  description?: string;
  tags: string[];
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Application {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  tags?: string[];
  datasetId?: string;
  policyId?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * 匿名用户ID
 */
export const ANONYMOUS_USER_ID = 'anonymous';

/**
 * 本地存储前缀
 */

export const LOCAL_STORAGE_PREFIX = 'tuna_';

/**
 * 本地存储应用列表键名
 */
export const LOCAL_STORAGE_APPS = `${LOCAL_STORAGE_PREFIX}apps`;

export const LOCAL_STORAGE_DATASET_PREFIX = `${LOCAL_STORAGE_PREFIX}dataset_`;

/**
 * 未登录时全部使用本匿名用户，数据基于匿名用户存储到本地
 */
export const ANONYMOUS_USER: User = {
  id: ANONYMOUS_USER_ID,
  username: 'Guest',
  displayName: 'Guest',
  isAnonymous: true
};

import { getBackendApiUrl } from '../utils/config';
import { ANONYMOUS_USER, User } from './Modules';

// API URL常量
// const USER_API_BASE_URL = '/users';

/**
 * 获取当前登录用户
 * @returns 当前用户，如果获取失败则返回匿名用户
 */
export async function getCurrentUser(): Promise<User> {
  try {
    const apiUrl = getBackendApiUrl();
    const response = await fetch(`${apiUrl}/userinfo`);
    if (!response.ok) {
      throw new Error(`Failed to fetch current user: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching current user:', error);
    return ANONYMOUS_USER;
  }
}

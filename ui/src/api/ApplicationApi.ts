import { getBackendApiUrl } from '../utils/config';
import { Application } from './Modules';

const APPLICATION_API_BASE_URL = '/applications';

/**
 * 获取当前用户的应用列表
 */
export async function getCurrentUserApplications(): Promise<Application[]> {
  return await getApplicationsByApi();
}

async function getApplicationsByApi(): Promise<Application[]> {
  try {
    const apiUrl = getBackendApiUrl();
    const response = await fetch(`${apiUrl}${APPLICATION_API_BASE_URL}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch applications: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching applications:', error);
    // 失败时返回空数组
    return [];
  }
}



/**
 * 创建新应用
 */
export async function createApplication(application: Partial<Application>): Promise<Application | null> {
  return await createApplicationByApi(application);
}

/**
 * 通过API创建应用
 */
async function createApplicationByApi(application: Partial<Application>): Promise<Application | null> {
  try {
    const apiUrl = getBackendApiUrl();
    const response = await fetch(`${apiUrl}${APPLICATION_API_BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(application)
    });

    if (!response.ok) {
      throw new Error(`Failed to create application: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating application:', error);
    // 失败时返回null
    return null;
  }
}

/**
 * 删除应用
 */
export async function deleteApplication(applicationId: string): Promise<boolean> {
  return await deleteApplicationByApi(applicationId);
}

/**
 * 通过API删除应用
 */
async function deleteApplicationByApi(applicationId: string): Promise<boolean> {
  try {
    const apiUrl = getBackendApiUrl();
    const response = await fetch(`${apiUrl}${APPLICATION_API_BASE_URL}/${applicationId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete application: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting application:', error);
    // 失败时返回false
    return false;
  }
}

/**
 * 获取应用详情
 */
export async function getApplicationById(applicationId: string): Promise<Application | null> {
  return await getApplicationByApi(applicationId);
}

/**
 * 通过API获取应用详情
 */
async function getApplicationByApi(applicationId: string): Promise<Application | null> {
  try {
    const apiUrl = getBackendApiUrl();
    const response = await fetch(`${apiUrl}${APPLICATION_API_BASE_URL}/${applicationId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch application: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching application:', error);
    // 失败时返回null
    return null;
  }
}

/**
 * 更新应用
 */
export async function updateApplication(application: Application): Promise<Application | null> {
  return await updateApplicationByApi(application);
}

/**
 * 通过API更新应用
 */
async function updateApplicationByApi(application: Application): Promise<Application | null> {
  try {
    const apiUrl = getBackendApiUrl();
    const response = await fetch(`${apiUrl}${APPLICATION_API_BASE_URL}/${application.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: application.name,
        description: application.description,
        logo: application.logo,
        tags: application.tags,
        datasetId: application.datasetId,
        policyId: application.policyId
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to update application: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating application:', error);
    // 失败时返回null
    return null;
  }
}

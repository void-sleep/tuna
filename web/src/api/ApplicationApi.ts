import { getBackendApiUrl } from '../utils/config';
import { Application, LOCAL_STORAGE_APPS } from './Modules';
import { getCurrentUser } from './UserApi';
import { anonymousDataset01, defaultApplications } from './MockApi';
import {
  createDataset,
  deleteDataset
} from './DatasetApi';

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
    // 失败时回退到本地获取
    return getLocalApplications();
  }
}

function getLocalApplications(): Application[] {
  try {
    const storedApps = localStorage.getItem(LOCAL_STORAGE_APPS);
    if (storedApps) {
      return JSON.parse(storedApps);
    }
    // 如果本地没有存储，设置默认数据并保存
    localStorage.setItem(LOCAL_STORAGE_APPS, JSON.stringify(defaultApplications));
    //设置默认dataset
    createDataset(anonymousDataset01);
    return defaultApplications;
  } catch (error) {
    console.error('Error reading applications from localStorage:', error);
    return defaultApplications;
  }
}

/**
 * 创建新应用
 */
export async function createApplication(application: Partial<Application>): Promise<Application> {
  try {
    // 首先创建一个空的数据集
    const dataset = await createDataset({
      name: `${application.name || '新应用'} 数据集`,
      description: `${application.name || '新应用'} 的数据集`,
      tags: application.tags || [],
      datas: []
    });

    // 将数据集ID关联到应用
    const appData = {
      ...application,
      datasetId: dataset.id
    };

    // 创建带有数据集ID的应用
    return await createApplicationByApi(appData);
  } catch (error) {
    console.error('Error creating dataset for application:', error);
    // 如果创建数据集失败，仍然继续创建应用，但没有关联数据集
    return await createApplicationByApi(application);
  }
}

/**
 * 通过API创建应用
 */
async function createApplicationByApi(application: Partial<Application>): Promise<Application> {
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
    // 失败时回退到本地创建
    const currentUser = await getCurrentUser();
    const appData = {
      ...application,
      createdBy: currentUser.id,
      createdAt: new Date(),
      updatedAt: new Date()
    } as Application;
    return createLocalApplication(appData);
  }
}

/**
 * 在本地创建应用
 */
function createLocalApplication(application: Application): Application {
  try {
    // 获取现有应用列表
    const apps = getLocalApplications();

    // 创建一个新应用，生成唯一ID
    const newApp: Application = {
      ...application,
      id: `local_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    };

    // 将新应用添加到列表中
    const updatedApps = [newApp, ...apps];

    // 保存到本地存储
    localStorage.setItem(LOCAL_STORAGE_APPS, JSON.stringify(updatedApps));

    return newApp;
  } catch (error) {
    console.error('Error creating application in localStorage:', error);
    throw new Error('Failed to create application locally');
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
    // 删除应用 - 远端应用的数据集管理由服务器处理，不在客户端尝试删除
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
    // 失败时回退到本地删除
    return deleteLocalApplication(applicationId);
  }
}

/**
 * 在本地删除应用
 */
function deleteLocalApplication(applicationId: string): boolean {
  try {
    // 获取现有应用列表
    const apps = getLocalApplications();
    // 查找要删除的应用 (为了获取其datasetId)
    const appToDelete = apps.find(app => app.id === applicationId);
    if (!appToDelete) {
      return false;
    }
    if (appToDelete.datasetId) {
      // 使用DatasetApi中的删除函数，只在本地模式下运行
      deleteDataset(appToDelete.datasetId).catch(_error => { });
    }

    // 过滤掉要删除的应用
    const updatedApps = apps.filter(app => app.id !== applicationId);

    // 如果长度相同，则表示没有找到要删除的应用
    if (updatedApps.length === apps.length) {
      return false;
    }

    // 保存到本地存储
    localStorage.setItem(LOCAL_STORAGE_APPS, JSON.stringify(updatedApps));

    return true;
  } catch (error) {
    console.error('Error deleting application from localStorage:', error);
    return false;
  }
}

/**
 * 获取应用详情
 */
export async function getApplicationById(applicationId: string): Promise<Application> {
  return await getApplicationByApi(applicationId);
}

/**
 * 通过API获取应用详情
 */
async function getApplicationByApi(applicationId: string): Promise<Application> {
  try {
    const apiUrl = getBackendApiUrl();
    const response = await fetch(`${apiUrl}${APPLICATION_API_BASE_URL}/${applicationId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch application: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching application:', error);
    // 失败时回退到本地获取
    return getLocalApplicationById(applicationId);
  }
}

/**
 * 从本地获取应用详情
 */
function getLocalApplicationById(applicationId: string): Application {
  const apps = getLocalApplications();
  const app = apps.find(app => app.id === applicationId);
  if (!app) {
    throw new Error(`Application not found: ${applicationId}`);
  }
  return app;
}

/**
 * 更新应用
 */
export async function updateApplication(application: Application): Promise<Application> {
  return await updateApplicationByApi(application);
}

/**
 * 通过API更新应用
 */
async function updateApplicationByApi(application: Application): Promise<Application> {
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
    // 失败时回退到本地更新
    return updateLocalApplication(application);
  }
}

/**
 * 在本地更新应用
 */
function updateLocalApplication(application: Application): Application {
  try {
    // 获取现有应用列表
    const apps = getLocalApplications();

    // 查找要更新的应用索引
    const appIndex = apps.findIndex(app => app.id === application.id);
    if (appIndex === -1) {
      throw new Error(`Application not found: ${application.id}`);
    }

    // 更新应用
    const updatedApp = {
      ...application,
      updatedAt: new Date()
    };

    // 更新应用列表
    const updatedApps = [...apps];
    updatedApps[appIndex] = updatedApp;

    // 保存到本地存储
    localStorage.setItem(LOCAL_STORAGE_APPS, JSON.stringify(updatedApps));

    return updatedApp;
  } catch (error) {
    console.error('Error updating application in localStorage:', error);
    throw new Error('Failed to update application locally');
  }
}

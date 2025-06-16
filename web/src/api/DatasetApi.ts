import { getBackendApiUrl } from '../utils/config';
import { Dataset } from './Modules';

const DATASET_API_BASE_URL = '/api/datasets'; // Adjusted for RecipeController endpoint

/**
 * 获取数据集详情
 */
export async function getDatasetById(datasetId: string): Promise<Dataset | null> {
  return await getDatasetByApi(datasetId);
}

/**
 * 通过API获取数据集详情
 */
async function getDatasetByApi(datasetId: string): Promise<Dataset | null> {
  try {
    const apiUrl = getBackendApiUrl();
    const response = await fetch(`${apiUrl}${DATASET_API_BASE_URL}/${datasetId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch dataset: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching dataset:', error);
    // 失败时返回null
    return null;
  }
}

/**
 * 获取数据集中的数据项列表
 */
export async function getDatasetItems(datasetId: string): Promise<any[]> {
  return await getDatasetItemsByApi(datasetId);
}

/**
 * 通过API获取数据集中的数据项列表
 */
async function getDatasetItemsByApi(datasetId: string): Promise<any[]> {
  try {
    const apiUrl = getBackendApiUrl();
    const url = `${apiUrl}${DATASET_API_BASE_URL}/${datasetId}/items`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch dataset items: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching dataset items:', error);
    // 失败时返回空数组
    return [];
  }
}

/**
 * 添加数据项到数据集
 */
export async function addDatasetItem(datasetId: string, item: any): Promise<any | null> {
  return await addDatasetItemByApi(datasetId, item);
}

/**
 * 通过API添加数据项到数据集
 */
async function addDatasetItemByApi(datasetId: string, item: any): Promise<any | null> {
  try {
    const apiUrl = getBackendApiUrl();
    const url = `${apiUrl}${DATASET_API_BASE_URL}/${datasetId}/items`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...item,
        datasetId,
        createdAt: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to add dataset item: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding dataset item:', error);
    // 失败时返回null
    return null;
  }
}

/**
 * 更新数据集中的数据项
 */
export async function updateDatasetItem(
  datasetId: string,
  itemId: string,
  item: any
): Promise<any | null> {
  return await updateDatasetItemByApi(datasetId, itemId, item);
}

/**
 * 通过API更新数据集中的数据项
 */
async function updateDatasetItemByApi(datasetId: string, itemId: string, item: any): Promise<any | null> {
  try {
    const apiUrl = getBackendApiUrl();
    const url = `${apiUrl}${DATASET_API_BASE_URL}/${datasetId}/items/${itemId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...item,
        updatedAt: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to update dataset item: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating dataset item:', error);
    // 失败时返回null
    return null;
  }
}

/**
 * 删除数据集中的数据项
 */
export async function deleteDatasetItem(datasetId: string, itemId: string): Promise<boolean> {
  return await deleteDatasetItemByApi(datasetId, itemId);
}

/**
 * 通过API删除数据集中的数据项
 */
async function deleteDatasetItemByApi(datasetId: string, itemId: string): Promise<boolean> {
  try {
    const apiUrl = getBackendApiUrl();
    const url = `${apiUrl}${DATASET_API_BASE_URL}/${datasetId}/items/${itemId}`;

    const response = await fetch(url, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete dataset item: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting dataset item:', error);
    // 失败时返回false
    return false;
  }
}

/**
 * 创建新数据集
 */
export async function createDataset(dataset: Partial<Dataset>): Promise<Dataset | null> {
  return await createDatasetByApi(dataset as Dataset);
}

/**
 * 通过API创建数据集
 */
async function createDatasetByApi(dataset: Dataset): Promise<Dataset | null> {
  try {
    const apiUrl = getBackendApiUrl();
    const response = await fetch(`${apiUrl}${DATASET_API_BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataset)
    });

    if (!response.ok) {
      throw new Error(`Failed to create dataset: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating dataset:', error);
    // 失败时返回null
    return null;
  }
}

/**
 * 更新数据集
 */
export async function updateDataset(dataset: Dataset): Promise<Dataset | null> {
  return await updateDatasetByApi(dataset);
}

/**
 * 通过API更新数据集
 */
async function updateDatasetByApi(dataset: Dataset): Promise<Dataset | null> {
  try {
    const apiUrl = getBackendApiUrl();
    const response = await fetch(`${apiUrl}${DATASET_API_BASE_URL}/${dataset.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...dataset,
        updatedAt: new Date()
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to update dataset: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating dataset:', error);
    // 失败时返回null
    return null;
  }
}

/**
 * 删除数据集
 */
export async function deleteDataset(datasetId: string): Promise<boolean> {
  return await deleteDatasetByApi(datasetId);
}

/**
 * 通过API删除数据集
 */
async function deleteDatasetByApi(datasetId: string): Promise<boolean> {
  try {
    const apiUrl = getBackendApiUrl();
    const response = await fetch(`${apiUrl}${DATASET_API_BASE_URL}/${datasetId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete dataset: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting dataset:', error);
    // 失败时返回false
    return false;
  }
}

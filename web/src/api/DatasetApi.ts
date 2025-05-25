import { getBackendApiUrl } from '../utils/config';
import { Dataset, LOCAL_STORAGE_DATASET_PREFIX } from './Modules';
import { getCurrentUser } from './UserApi';

const DATASET_API_BASE_URL = '/datasets';

/**
 * 获取数据集详情
 */
export async function getDatasetById(datasetId: string): Promise<Dataset> {
  return await getDatasetByApi(datasetId);
}

/**
 * 通过API获取数据集详情
 */
async function getDatasetByApi(datasetId: string): Promise<Dataset> {
  try {
    const apiUrl = getBackendApiUrl();
    const response = await fetch(`${apiUrl}${DATASET_API_BASE_URL}/${datasetId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch dataset: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching dataset:', error);
    // 失败时回退到本地获取
    return getLocalDatasetById(datasetId);
  }
}

/**
 * 从本地获取数据集详情
 */
function getLocalDatasetById(datasetId: string): Dataset {
  try {
    const storageKey = `${LOCAL_STORAGE_DATASET_PREFIX}${datasetId}`;
    const storedDataset = localStorage.getItem(storageKey);

    if (storedDataset) {
      return JSON.parse(storedDataset);
    }

    throw new Error(`Dataset not found: ${datasetId}`);
  } catch (error) {
    console.error(`Error retrieving dataset ${datasetId} from localStorage:`, error);
    // 如果本地没有，创建一个空的数据集
    const emptyDataset: Dataset = {
      id: datasetId,
      name: `Dataset ${datasetId}`,
      description: 'Local dataset',
      tags: [],
      datas: []
    };

    // 保存到本地存储
    localStorage.setItem(
      `${LOCAL_STORAGE_DATASET_PREFIX}${datasetId}`,
      JSON.stringify(emptyDataset)
    );

    return emptyDataset;
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
    // 失败时回退到本地获取
    return getLocalDatasetItems(datasetId);
  }
}

/**
 * 从本地获取数据集中的数据项列表
 */
function getLocalDatasetItems(datasetId: string): any[] {
  try {
    const dataset = getLocalDatasetById(datasetId);
    return dataset.datas || [];
  } catch (error) {
    console.error('Error getting local dataset items:', error);
    return [];
  }
}

/**
 * 添加数据项到数据集
 */
export async function addDatasetItem(datasetId: string, item: any): Promise<any> {
  return await addDatasetItemByApi(datasetId, item);
}

/**
 * 通过API添加数据项到数据集
 */
async function addDatasetItemByApi(datasetId: string, item: any): Promise<any> {
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
    // 失败时回退到本地添加
    return addLocalDatasetItem(datasetId, item);
  }
}

/**
 * 在本地添加数据项到数据集
 */
function addLocalDatasetItem(datasetId: string, item: any): any {
  try {
    const storageKey = `${LOCAL_STORAGE_DATASET_PREFIX}${datasetId}`;
    let dataset = getLocalDatasetById(datasetId);

    if (!dataset.datas) {
      dataset.datas = [];
    }

    // 创建新的数据项
    const newItem = {
      ...item,
      id: `item_${datasetId}_${Date.now()}`,
      datasetId,
      createdAt: new Date().toISOString()
    };

    // 添加到数据集
    dataset.datas.push(newItem);

    // 保存到本地存储
    localStorage.setItem(storageKey, JSON.stringify(dataset));

    return newItem;
  } catch (error) {
    console.error('Error adding dataset item to localStorage:', error);
    throw new Error('Failed to add dataset item locally');
  }
}

/**
 * 更新数据集中的数据项
 */
export async function updateDatasetItem(
  datasetId: string,
  itemId: string,
  item: any
): Promise<any> {
  return await updateDatasetItemByApi(datasetId, itemId, item);
}

/**
 * 通过API更新数据集中的数据项
 */
async function updateDatasetItemByApi(datasetId: string, itemId: string, item: any): Promise<any> {
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
    // 失败时回退到本地更新
    return updateLocalDatasetItem(datasetId, itemId, item);
  }
}

/**
 * 在本地更新数据集中的数据项
 */
function updateLocalDatasetItem(datasetId: string, itemId: string, item: any): any {
  try {
    const storageKey = `${LOCAL_STORAGE_DATASET_PREFIX}${datasetId}`;
    let dataset = getLocalDatasetById(datasetId);

    if (!dataset.datas) {
      throw new Error(`Dataset has no items: ${datasetId}`);
    }

    // 查找要更新的数据项索引
    const itemIndex = dataset.datas.findIndex(dataItem => dataItem.id === itemId);
    if (itemIndex === -1) {
      throw new Error(`Dataset item not found: ${itemId}`);
    }

    // 更新数据项
    const updatedItem = {
      ...item,
      id: itemId,
      datasetId,
      updatedAt: new Date().toISOString()
    };

    // 更新数据集
    dataset.datas[itemIndex] = updatedItem;

    // 保存到本地存储
    localStorage.setItem(storageKey, JSON.stringify(dataset));

    return updatedItem;
  } catch (error) {
    console.error('Error updating dataset item in localStorage:', error);
    throw new Error('Failed to update dataset item locally');
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
    // 失败时回退到本地删除
    return deleteLocalDatasetItem(datasetId, itemId);
  }
}

/**
 * 在本地删除数据集中的数据项
 */
function deleteLocalDatasetItem(datasetId: string, itemId: string): boolean {
  try {
    const storageKey = `${LOCAL_STORAGE_DATASET_PREFIX}${datasetId}`;
    let dataset = getLocalDatasetById(datasetId);

    if (!dataset.datas) {
      return false;
    }

    // 过滤掉要删除的数据项
    const filteredItems = dataset.datas.filter(item => item.id !== itemId);

    // 如果长度相同，则表示没有找到要删除的数据项
    if (filteredItems.length === dataset.datas.length) {
      return false;
    }

    // 更新数据集
    dataset.datas = filteredItems;

    // 保存到本地存储
    localStorage.setItem(storageKey, JSON.stringify(dataset));

    return true;
  } catch (error) {
    console.error('Error deleting dataset item from localStorage:', error);
    return false;
  }
}

/**
 * 创建新数据集
 */
export async function createDataset(dataset: Partial<Dataset>): Promise<Dataset> {
  const currentUser = await getCurrentUser();
  const datasetData = {
    ...dataset,
    createdBy: currentUser.id,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return await createDatasetByApi(datasetData as Dataset);
}

/**
 * 通过API创建数据集
 */
async function createDatasetByApi(dataset: Dataset): Promise<Dataset> {
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
    // 失败时回退到本地创建
    return createLocalDataset(dataset);
  }
}

/**
 * 在本地创建数据集
 */
function createLocalDataset(dataset: Dataset): Dataset {
  try {
    // 创建一个新数据集，生成唯一ID
    const newDataset: Dataset = {
      ...dataset,
      id: dataset.id || `dataset_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      datas: dataset.datas || []
    };
    // 保存到本地存储
    localStorage.setItem(
      `${LOCAL_STORAGE_DATASET_PREFIX}${newDataset.id}`,
      JSON.stringify(newDataset)
    );
    return newDataset;
  } catch (error) {
    console.error('Error creating dataset in localStorage:', error);
    throw new Error('Failed to create dataset locally');
  }
}

/**
 * 更新数据集
 */
export async function updateDataset(dataset: Dataset): Promise<Dataset> {
  return await updateDatasetByApi(dataset);
}

/**
 * 通过API更新数据集
 */
async function updateDatasetByApi(dataset: Dataset): Promise<Dataset> {
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
    // 失败时回退到本地更新
    return updateLocalDataset(dataset);
  }
}

/**
 * 在本地更新数据集
 */
function updateLocalDataset(dataset: Dataset): Dataset {
  try {
    const storageKey = `${LOCAL_STORAGE_DATASET_PREFIX}${dataset.id}`;

    // 获取现有数据集
    let existingDataset: Dataset;
    try {
      existingDataset = getLocalDatasetById(dataset.id);
    } catch (error) {
      // 如果不存在，创建一个新的
      return createLocalDataset(dataset);
    }

    // 更新数据集，保持数据项
    const updatedDataset: Dataset = {
      ...dataset,
      datas: dataset.datas || existingDataset.datas || [],
      updatedAt: new Date()
    };

    // 保存到本地存储
    localStorage.setItem(storageKey, JSON.stringify(updatedDataset));

    return updatedDataset;
  } catch (error) {
    console.error('Error updating dataset in localStorage:', error);
    throw new Error('Failed to update dataset locally');
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
    // 失败时回退到本地删除
    return deleteLocalDataset(datasetId);
  }
}

/**
 * 在本地删除数据集
 */
function deleteLocalDataset(datasetId: string): boolean {
  try {
    const storageKey = `${LOCAL_STORAGE_DATASET_PREFIX}${datasetId}`;

    // 检查数据集是否存在
    if (!localStorage.getItem(storageKey)) {
      return false;
    }

    // 从本地存储中删除
    localStorage.removeItem(storageKey);

    return true;
  } catch (error) {
    console.error('Error deleting dataset from localStorage:', error);
    return false;
  }
}

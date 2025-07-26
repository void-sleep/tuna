import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Application } from '../api/Modules';
import {
  getDatasetItems,
  addDatasetItem,
  updateDatasetItem,
  deleteDatasetItem
} from '../api/DatasetApi';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CloseIcon from '@mui/icons-material/Close';

// 数据项接口
interface DataItem {
  id: string;
  applicationId: string;
  name: string;
  description: string;
  tags: string[];
  createdAt: string;
}

interface DataItemDialogProps {
  open: boolean;
  mode: 'add' | 'edit';
  initialData: DataItem | null;
  availableTags: string[];
  applicationId: string;
  onClose: () => void;
  onSave: (data: DataItem) => void;
}

interface ApplicationDatasetEditorProps {
  application: Application | null;
  loading: boolean;
}

// 简化后的数据集表格组件
const DatasetTable = ({ application }: { application: Application | null }) => {
  const [datasetItems, setDatasetItems] = React.useState<DataItem[]>([]);
  const [loadingItems, setLoadingItems] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [dataItemDialogState, setDataItemDialogState] = React.useState<{
    open: boolean;
    mode: 'add' | 'edit';
    item: DataItem | null;
  }>({
    open: false,
    mode: 'add',
    item: null
  });
  const [deleteDialogState, setDeleteDialogState] = React.useState<{
    open: boolean;
    item: DataItem | null;
  }>({
    open: false,
    item: null
  });

  const loadDatasetItems = React.useCallback(async () => {
    if (!application?.datasetId) {
      setError('应用未关联数据集');
      setLoadingItems(false);
      return;
    }

    try {
      setLoadingItems(true);
      const items = await getDatasetItems(application.datasetId);
      setDatasetItems(items || []);
      setError(null);
    } catch (err) {
      console.error('Error loading dataset items:', err);
      setError('无法加载数据项');
    } finally {
      setLoadingItems(false);
    }
  }, [application]);

  React.useEffect(() => {
    loadDatasetItems();
  }, [loadDatasetItems]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // 添加数据项弹窗
  const handleAddItem = () => {
    if (!application?.id) return;

    setDataItemDialogState({
      open: true,
      mode: 'add',
      item: {
        id: '',
        applicationId: application.id,
        name: '',
        description: '',
        tags: [],
        createdAt: new Date().toISOString()
      }
    });
  };

  // 打开编辑数据项弹窗
  const handleOpenEditDialog = (item: DataItem) => {
    setDataItemDialogState({
      open: true,
      mode: 'edit',
      item: { ...item }
    });
  };

  // 关闭数据项弹窗
  const handleCloseItemDialog = () => {
    setDataItemDialogState({
      ...dataItemDialogState,
      open: false
    });
  };

  // 打开删除确认弹窗
  const handleOpenDeleteDialog = (item: DataItem) => {
    setDeleteDialogState({
      open: true,
      item
    });
  };

  // 关闭删除确认弹窗
  const handleCloseDeleteDialog = () => {
    setDeleteDialogState({
      ...deleteDialogState,
      open: false
    });
  };

  // 删除数据项
  const handleDeleteItem = async () => {
    if (!application?.datasetId || !deleteDialogState.item) return;

    try {
      await deleteDatasetItem(application.datasetId, deleteDialogState.item.id);

      // 直接更新本地数据，避免重新加载
      setDatasetItems(prev => prev.filter(item => item.id !== deleteDialogState.item?.id));

      // 关闭弹窗
      setDeleteDialogState({
        open: false,
        item: null
      });
    } catch (error) {
      console.error('删除数据项失败:', error);
    }
  };

  // 保存数据项
  const handleSaveDataItem = async (data: DataItem) => {
    if (!application?.datasetId) return;

    try {
      if (dataItemDialogState.mode === 'add') {
        // 添加新数据项
        const newItem = await addDatasetItem(application.datasetId, data);
        // 更新本地数据
        setDatasetItems(prev => [...prev, newItem]);
      } else {
        // 更新现有数据项
        const updatedItem = await updateDatasetItem(application.datasetId, data.id, data);
        // 更新本地数据
        setDatasetItems(prev =>
          prev.map(item => (item.id === updatedItem.id ? updatedItem : item))
        );
      }

      // 关闭弹窗
      setDataItemDialogState({
        ...dataItemDialogState,
        open: false
      });
    } catch (error) {
      console.error('保存数据项失败:', error);
    }
  };

  // 过滤数据（不需要分页）
  const filteredItems = datasetItems.filter(
    item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.tags &&
        item.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  if (loadingItems) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflow: 'hidden'
      }}
    >
      {/* 搜索和添加按钮放在顶部 */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          flexShrink: 0
        }}
      >
        <TextField
          placeholder="搜索数据项..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ width: '30%' }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddItem}
          sx={{ borderRadius: 2 }}
        >
          添加数据项
        </Button>
      </Box>

      {datasetItems.length === 0 ? (
        <Box
          sx={{
            p: 4,
            textAlign: 'center',
            color: 'text.secondary',
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          暂无数据项，请点击&quot;添加数据项&quot;按钮创建
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            overflow: 'hidden',
            px: 2,
            pb: 2
          }}
        >
          <TableContainer
            component={Paper}
            sx={{
              boxShadow: 'none',
              border: '1px solid rgba(0, 0, 0, 0.12)',
              borderRadius: 2,
              overflow: 'auto',
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Table
              stickyHeader
              size="small"
              aria-label="数据集表格"
              sx={{
                width: '100%',
                tableLayout: 'fixed',
                '& .MuiTableCell-head': {
                  fontWeight: 600,
                  backgroundColor: 'rgba(0, 0, 0, 0.02)'
                },
                '& .MuiTableCell-root': {
                  borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                  padding: '12px 16px'
                }
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell width="20%">名称</TableCell>
                  <TableCell width="35%">描述</TableCell>
                  <TableCell width="20%">标签</TableCell>
                  <TableCell width="15%">创建时间</TableCell>
                  <TableCell width="10%" align="center">
                    操作
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems.length > 0 ? (
                  filteredItems.map(item => (
                    <TableRow
                      key={item.id}
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.01)' }
                      }}
                    >
                      <TableCell component="th" scope="row">
                        <Typography
                          variant="body2"
                          fontWeight={500}
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {item.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {item.description || ''}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {item.tags && item.tags.length > 0 ? (
                            item.tags.map((tag: string, index: number) => (
                              <Chip
                                key={index}
                                label={tag}
                                size="small"
                                sx={{ height: 22, fontSize: '0.75rem' }}
                              />
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <Tooltip title="编辑">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEditDialog(item)}
                              sx={{ mr: 1 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="删除">
                            <IconButton size="small" onClick={() => handleOpenDeleteDialog(item)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary">没有符合搜索条件的数据项</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* 数据项编辑弹窗 */}
      <DataItemDialog
        open={dataItemDialogState.open}
        mode={dataItemDialogState.mode}
        initialData={dataItemDialogState.item}
        availableTags={application?.tags || []}
        applicationId={application?.id || ''}
        onClose={handleCloseItemDialog}
        onSave={handleSaveDataItem}
      />

      {/* 删除确认弹窗 */}
      <Dialog
        open={deleteDialogState.open}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">确认删除</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            确定要删除「{deleteDialogState.item?.name}」数据项吗？此操作不可撤销。
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDeleteDialog} color="inherit">
            取消
          </Button>
          <Button onClick={handleDeleteItem} color="error" variant="contained" autoFocus>
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// 数据项编辑弹窗组件
const DataItemDialog: React.FC<DataItemDialogProps> = ({
  open,
  mode,
  initialData,
  availableTags,
  applicationId,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = React.useState<DataItem>({
    id: '',
    applicationId: '',
    name: '',
    description: '',
    tags: [],
    createdAt: ''
  });
  const [newTag, setNewTag] = React.useState('');
  const [errors, setErrors] = React.useState<{
    name?: string;
  }>({});

  // 初始化表单数据
  React.useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || '',
        applicationId: initialData.applicationId || applicationId,
        name: initialData.name || '',
        description: initialData.description || '',
        tags: initialData.tags || [],
        createdAt: initialData.createdAt || new Date().toISOString()
      });
    }
  }, [initialData, applicationId]);

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // 清除错误
    if (name === 'name' && errors.name) {
      setErrors({ ...errors, name: undefined });
    }
  };

  // 添加标签
  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  // 删除标签
  const handleDeleteTag = (tagToDelete: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToDelete)
    });
  };

  // 选择现有标签
  const handleSelectExistingTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag]
      });
    }
  };

  // 处理保存
  const handleSave = () => {
    // 验证
    const newErrors: { name?: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = '名称不能为空';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, fontWeight: 500 }}>
        {mode === 'add' ? '添加数据项' : '编辑数据项'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme => theme.palette.grey[500]
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ p: 1 }}>
          <TextField
            fullWidth
            required
            label="名称"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            error={!!errors.name}
            helperText={errors.name}
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            label="描述"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            multiline
            rows={4}
            sx={{ mb: 4 }}
          />

          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            标签
          </Typography>

          {/* 已选标签 */}
          <Box sx={{ mb: 3 }}>
            {formData.tags.length > 0 ? (
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {formData.tags.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleDeleteTag(tag)}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                未添加标签
              </Typography>
            )}
          </Box>

          {/* 应用现有标签 */}
          {availableTags.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                从应用标签中选择:
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {availableTags
                  .filter(tag => !formData.tags.includes(tag))
                  .map(tag => (
                    <Chip
                      key={tag}
                      label={tag}
                      variant="outlined"
                      onClick={() => handleSelectExistingTag(tag)}
                      sx={{ mb: 1 }}
                    />
                  ))}
              </Stack>
            </Box>
          )}

          {/* 添加新标签 */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              size="small"
              variant="outlined"
              placeholder="添加新标签"
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              sx={{ mr: 1, flex: 1 }}
            />
            <Button variant="outlined" onClick={handleAddTag} disabled={!newTag.trim()}>
              添加
            </Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          取消
        </Button>
        <Button onClick={handleSave} variant="contained">
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// 简化后的ApplicationDatasetEditor组件
const ApplicationDatasetEditor: React.FC<ApplicationDatasetEditorProps> = ({
  application,
  loading
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {application ? (
        <DatasetTable application={application} />
      ) : (
        <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>请先保存应用基本信息</Box>
      )}
    </Box>
  );
};

export default ApplicationDatasetEditor;

import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid2';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { Application } from '../api/Modules';
import {
  getCurrentUserApplications,
  createApplication,
  deleteApplication
} from '../api/ApplicationApi';
import ApplicationCard from './ApplicationCard';
import CreateApplicationDialog from './CreateApplicationDialog';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';

interface ApplicationsPageProps {
  onNewClick: () => void;
  onAppClick: (id: string) => void;
  _onNavigateToShake: (id: string) => void;
}

const ApplicationsPage: React.FC<ApplicationsPageProps> = ({
  onNewClick,
  onAppClick,
  _onNavigateToShake
}) => {
  const navigate = useNavigate();

  const [applications, setApplications] = React.useState<Application[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [operationLoading, setOperationLoading] = React.useState<boolean>(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // 加载应用数据
  React.useEffect(() => {
    loadApplications();
  }, []);

  // 加载应用列表
  const loadApplications = async () => {
    try {
      setLoading(true);
      const apps = await getCurrentUserApplications();
      setApplications(apps || []);
    } catch (error) {
      console.error('Error loading applications:', error);
      setApplications([]);
      setSnackbar({
        open: true,
        message: '加载应用失败',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // 打开应用
  const handleNavigateToApp = (appId: string) => {
    // 导航到应用编辑页面
    navigate(`/apps/${appId}`);
  };

  // 编辑应用
  const handleEditApp = (app: Application) => {
    navigate(`/apps/${app.id}`);
  };

  // 显示成功信息
  const showSuccessMessage = (message: string) => {
    setSnackbar({
      open: true,
      message: message,
      severity: 'success'
    });

    // 2秒后自动关闭
    setTimeout(() => {
      setSnackbar(prev => ({ ...prev, open: false }));
    }, 2000);
  };

  // 显示错误信息
  const showErrorMessage = (message: string) => {
    setSnackbar({
      open: true,
      message: message,
      severity: 'error'
    });
  };

  // 删除应用
  const handleDeleteApp = async (app: Application) => {
    try {
      setOperationLoading(true);

      // 从当前列表中移除应用
      setApplications(prevApps => prevApps.filter(a => a.id !== app.id));

      // 调用API删除应用
      const result = await deleteApplication(app.id);

      if (result) {
        // 显示成功消息
        showSuccessMessage('应用已删除');
      } else {
        throw new Error('删除应用失败');
      }
    } catch (error) {
      console.error('删除应用失败:', error);
      // 恢复应用到列表
      loadApplications();
      showErrorMessage('删除应用失败');
    } finally {
      setOperationLoading(false);
    }
  };

  // 打开创建应用对话框
  const handleOpenCreateDialog = () => {
    setCreateDialogOpen(true);
  };

  // 关闭创建应用对话框
  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
  };

  // 关闭提示框
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 创建新应用
  const handleCreateApplication = async (appData: Partial<Application>) => {
    try {
      // 显示加载状态
      setOperationLoading(true);

      // 调用API创建应用
      const newApp = await createApplication(appData);

      if (newApp) {
        // 更新本地状态
        setApplications(prevApps => [newApp, ...prevApps]);

        // 关闭对话框
        setCreateDialogOpen(false);

        // 显示成功提示
        showSuccessMessage('应用创建成功');

        // 导航到应用编辑页面
        setTimeout(() => {
          handleNavigateToApp(newApp.id);
        }, 300);
      } else {
        showErrorMessage('创建应用失败');
      }
    } catch (error) {
      console.error('创建应用失败:', error);
      showErrorMessage('创建应用失败');
    } finally {
      setOperationLoading(false);
    }
  };

  const filteredApps = applications.filter(
    app =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.description && app.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // 处理描述点击，导航到特定应用的Shake页面
  const handleNavigateToAppShake = (appId: string) => {
    // 导航到应用的Shake页面，带上应用ID
    navigate(`/shake/${appId}`);
  };

  // 显示加载指示器
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">我的应用</Typography>
        <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', sm: 'auto' } }}>
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: { xs: '100%', sm: 240 },
              height: 40,
              borderRadius: 20,
              border: '1px solid',
              borderColor: 'divider',
              px: 2
            }}
          >
            <SearchIcon sx={{ color: 'text.secondary', fontSize: 20, mr: 1 }} />
            <InputBase
              placeholder="搜索"
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{ flex: 1, fontSize: '0.875rem' }}
            />
          </Paper>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            disableElevation
            onClick={handleOpenCreateDialog}
            disabled={operationLoading}
            sx={{
              borderRadius: 20,
              height: 40,
              px: 2,
              textTransform: 'none',
              fontWeight: 'normal'
            }}
          >
            创建
          </Button>
        </Box>
      </Box>

      {/* App grid */}
      {filteredApps.length > 0 ? (
        <Grid container spacing={3}>
          {filteredApps.map((app, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={app.id}>
              <ApplicationCard
                application={app}
                index={index}
                onCardClick={() => handleNavigateToAppShake(app.id)}
                onEdit={handleEditApp}
                onDelete={handleDeleteApp}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 2,
            border: '1px dashed',
            borderColor: 'divider'
          }}
        >
          <Typography color="text.secondary">没有找到匹配的应用</Typography>
        </Paper>
      )}

      {/* 创建应用对话框 */}
      <CreateApplicationDialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        onSubmit={handleCreateApplication}
        loading={operationLoading}
      />

      {/* 提示消息 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ApplicationsPage;

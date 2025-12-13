import * as React from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';
import { Application } from '../api/Modules';
import { getApplicationById } from '../api/ApplicationApi';
import ApplicationBasicInfo from './ApplicationBasicInfo';
import ApplicationDatasetEditor from './ApplicationDatasetEditor';

// 定义标签页内容接口
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// 标签页内容组件
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        pointerEvents: 'auto'
      }}
      {...other}
    >
      {value === index && (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'visible',
          pointerEvents: 'auto'
        }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// 获取props
function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`
  };
}

// 应用编辑页面组件
const ApplicationEditor: React.FC = () => {
  // 获取路由参数
  const { appId } = useParams<{ appId: string }>();

  // 状态
  const [tabIndex, setTabIndex] = React.useState(0);
  const [loading, setLoading] = React.useState(true); // 初始加载状态
  const [application, setApplication] = React.useState<Application | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // 加载应用数据
  React.useEffect(() => {
    const fetchApplication = async () => {
      if (!appId) return;

      try {
        setLoading(true); // 设置加载状态
        setError(null);
        const app = await getApplicationById(appId);
        if (!app) {
          setError('应用不存在或无法访问');
          return;
        }
        setApplication(app);
      } catch (error) {
        console.error('加载应用失败:', error);
        setError('无法加载应用数据');
      } finally {
        setLoading(false); // 无论成功失败都结束加载状态
      }
    };

    fetchApplication();
  }, [appId]);

  // 处理标签页切换
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  // 仅在初始加载时显示加载中状态，避免UI闪烁
  if (loading && !application) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'error.main' }}>
        {error}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', width: '100%', height: 'calc(100vh - 64px)' }}>
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={tabIndex}
        onChange={handleTabChange}
        aria-label="应用编辑标签页"
        sx={{
          borderRight: 1,
          borderColor: 'divider',
          width: 200,
          '& .MuiTabs-indicator': {
            left: 0
          },
          '& .MuiTab-root': {
            alignItems: 'flex-start',
            textAlign: 'left'
          }
        }}
      >
        <Tab label="基本信息" {...a11yProps(0)} />
        <Tab label="数据编排" {...a11yProps(1)} />
      </Tabs>
      <Box sx={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
        <TabPanel value={tabIndex} index={0}>
          <ApplicationBasicInfo application={application} />
        </TabPanel>
        <TabPanel value={tabIndex} index={1}>
          <ApplicationDatasetEditor
            application={application}
            loading={loading}
          />
        </TabPanel>
      </Box>
    </Box>
  );
};

export default ApplicationEditor;

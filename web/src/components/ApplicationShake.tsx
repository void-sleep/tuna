import * as React from 'react';
import { LuckyWheel } from '@lucky-canvas/react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { Application } from '../api/Modules';
import { getApplicationById } from '../api/ApplicationApi';
import { getDatasetItems } from '../api/DatasetApi';
import ShakeDataDetail from './ShakeDataDetail';
import { defaultBlocks, defaultPrizeList } from '../api/MockApi';

export default function ApplicationShake() {
  const { appId } = useParams<{ appId?: string }>();
  const [currentApp, setCurrentApp] = React.useState<Application | null>(null);
  const [loading, setLoading] = React.useState<boolean>(!!appId);
  const [error, setError] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const [selectedData, setSelectedData] = React.useState<any>(null);
  const [isSpinning, setIsSpinning] = React.useState(false);
  // 数据集存储，用于查询获取详细信息
  const [datasetItems, setDatasetItems] = React.useState<any[]>([]);

  // 固定的旋转盘配置
  const [blocks] = React.useState(defaultBlocks);

  // 固定的奖品配置
  const [prizes] = React.useState(defaultPrizeList);

  // 固定的按钮配置
  const [buttons] = React.useState([
    { radius: '40%', background: '#617df2' },
    { radius: '35%', background: '#afc4f8' },
    {
      radius: '30%',
      background: '#869cfa',
      pointer: true,
      fonts: [{ text: '摇一摇', top: '-10px' }]
    }
  ]);

  // 加载应用数据
  React.useEffect(() => {
    if (appId) {
      setLoading(true);
      setError(null);

      getApplicationById(appId)
        .then(app => {
          if (!app) {
            setError('应用不存在或无法访问');
            return Promise.reject(new Error('Application not found'));
          }

          setCurrentApp(app);
          let datasetPromise;
          if (app.datasetId) {
            datasetPromise = getDatasetItems(app.datasetId);
          } else {
            datasetPromise = Promise.resolve([]);
          }
          return Promise.all([Promise.resolve(app), datasetPromise]);
        })
        .then(([, dataset]) => {
          setDatasetItems(dataset || []);
        })
        .catch(error => {
          console.error('加载应用数据失败:', error);
          setError('无法加载应用数据，请稍后再试');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [appId]);

  const handleClose = () => {
    setOpen(false);
  };

  const selfLucky = React.useRef<any>(null);

  const handleStart = () => {
    // 开始旋转
    setIsSpinning(true);

    return new Promise<number>(resolve => {
      // 检查是否有数据集
      if (!datasetItems || datasetItems.length === 0) {
        // 应用数据集为空时
        setTimeout(() => {
          // 停止在第一个位置
          selfLucky.current.stop(0);

          // 显示没有数据的提示
          setSelectedData({
            id: 'no-data',
            name: '没有数据',
            category: currentApp?.name || '应用',
            description: '当前应用没有数据项，请先添加数据。',
            tags: []
          });

          setTimeout(() => {
            setOpen(true);
            setIsSpinning(false);
          }, 2500);
        }, 2500);

        selfLucky.current.play();
        resolve(0);
        return;
      }

      // 如果有数据集，从数据集中随机选择一个
      const randomIndex = Math.floor(Math.random() * datasetItems.length);
      const randomItem = datasetItems[randomIndex];

      // 找到对应的prize索引，优先匹配标签
      let prizeIndex = 0;

      if (randomItem.tags && randomItem.tags.length > 0) {
        // 尝试找到与数据项标签匹配的prize
        const randomTag = randomItem.tags[Math.floor(Math.random() * randomItem.tags.length)];

        // 查找prize列表中是否有匹配的标签
        const matchingPrizeIndex = prizes.findIndex(
          prize => prize.fonts && prize.fonts[0] && prize.fonts[0].text === randomTag
        );

        // 如果找到匹配的prize，使用它的索引
        if (matchingPrizeIndex >= 0) {
          prizeIndex = matchingPrizeIndex;
        } else {
          // 没有找到匹配的，使用随机索引但确保在prizes范围内
          prizeIndex = Math.floor(Math.random() * prizes.length);
        }
      } else {
        // 如果数据项没有标签，随机选择一个prize索引
        prizeIndex = Math.floor(Math.random() * prizes.length);
      }

      // 开始旋转
      selfLucky.current.play();

      // 设置停止位置
      setTimeout(() => {
        selfLucky.current.stop(prizeIndex);

        // 使用已经随机选择的数据项
        setTimeout(() => {
          setSelectedData(randomItem);
          setOpen(true);
          setIsSpinning(false);
        }, 2500);
      }, 2500);

      resolve(prizeIndex);
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 2
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 12 }}>
      <LuckyWheel
        ref={selfLucky}
        width="380px"
        height="380px"
        blocks={blocks}
        prizes={prizes}
        buttons={buttons}
        onStart={handleStart}
        disabled={isSpinning}
      />
      {selectedData && (
        <ShakeDataDetail handleClose={handleClose} open={open} data={selectedData} />
      )}
    </Box>
  );
}

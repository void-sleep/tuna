import * as React from 'react';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid2';
import SaveIcon from '@mui/icons-material/Save';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { getIconBackground } from './ApplicationCard';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import FestivalIcon from '@mui/icons-material/Festival';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import EngineeringIcon from '@mui/icons-material/Engineering';
import { Application } from '../api/Modules';
import { updateApplication } from '../api/ApplicationApi';

// 应用图标列表
const APP_ICONS = [
  { icon: <SmartToyIcon />, name: '机器人', color: '#3f51b5' },
  { icon: <RestaurantIcon />, name: '餐饮', color: '#ff9800' },
  { icon: <SportsEsportsIcon />, name: '游戏', color: '#9c27b0' },
  { icon: <TravelExploreIcon />, name: '探索', color: '#03a9f4' },
  { icon: <EngineeringIcon />, name: '工程', color: '#4caf50' },
  { icon: <FestivalIcon />, name: '娱乐', color: '#f50057' }
];

// 组件Props定义
interface ApplicationBasicInfoProps {
  application: Application | null;
}

const ApplicationBasicInfo: React.FC<ApplicationBasicInfoProps> = ({ application }) => {
  // 状态
  const [saving, setSaving] = React.useState(false);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [tags, setTags] = React.useState<string[]>([]);
  const [iconIndex, setIconIndex] = React.useState(0);
  const [newTag, setNewTag] = React.useState('');
  const [message, setMessage] = React.useState({ open: false, text: '', type: 'success' as 'success' | 'error' });

  // 当应用数据变化时初始化状态
  React.useEffect(() => {
    if (application) {
      setName(application.name || '');
      setDescription(application.description || '');
      setTags(application.tags || []);
      setIconIndex(application.logo ? parseInt(application.logo) : 0);
    }
  }, [application]);

  // 处理消息提示
  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ open: true, text, type });
  };

  const closeMessage = () => {
    setMessage({ ...message, open: false });
  };

  // 添加标签
  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setNewTag('');
    }
  };

  // 处理标签输入回车
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // 保存应用
  const handleSave = async () => {
    if (!application) {
      showMessage('应用数据不存在', 'error');
      return;
    }

    if (!name.trim()) {
      showMessage('应用名称不能为空', 'error');
      return;
    }

    try {
      setSaving(true);

      const updatedApplication = {
        ...application,
        name: name.trim(),
        description: description.trim() || undefined,
        tags,
        logo: iconIndex.toString()
      };

      const result = await updateApplication(updatedApplication);
      if (result) {
        showMessage('保存成功', 'success');
      } else {
        showMessage('保存失败', 'error');
      }
    } catch (error) {
      showMessage('保存失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  // 加载中状态
  if (!application) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, position: 'relative',p:2, zIndex: 1 }}>
      <Box sx={{ mb: 5 }}>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>应用图标</Typography>
        <Grid container spacing={2} sx={{ mb: 1 }}>
          {APP_ICONS.map((iconObj, index) => (
            <Grid key={index}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: getIconBackground(index),
                  color: iconObj.color,
                  cursor: 'pointer',
                  border: index === iconIndex ? `2px solid ${iconObj.color}` : 'none',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'scale(1.08)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }
                }}
                onClick={() => setIconIndex(index)}
              >
                {React.cloneElement(iconObj.icon, { sx: { fontSize: 28 } })}
              </Avatar>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* 名称输入 */}
      <TextField
        autoFocus
        fullWidth
        required
        label="应用名称"
        variant="outlined"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={saving}
        sx={{ mb: 4, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
      />

      {/* 描述输入 */}
      <TextField
        fullWidth
        label="应用描述"
        variant="outlined"
        multiline
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={saving}
        sx={{ mb: 5, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
      />

      {/* 标签管理 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>标签</Typography>

        {/* 标签列表 */}
        {tags.length > 0 ? (
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {tags.map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => setTags(tags.filter(t => t !== tag))}
                  sx={{
                    mb: 1,
                    borderRadius: 3,
                    bgcolor: 'rgba(0, 0, 0, 0.05)',
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.08)' }
                  }}
                />
              ))}
            </Stack>
          </Box>
        ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>暂无标签</Typography>
        )}

        {/* 添加标签 */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            size="small"
            variant="outlined"
            placeholder="添加标签"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleTagKeyDown}
            disabled={saving}
            sx={{
              mr: 1,
              flex: 1,
              '& .MuiOutlinedInput-root': { borderRadius: 1.5 }
            }}
          />
          <Button
            variant="outlined"
            onClick={handleAddTag}
            disabled={!newTag.trim() || saving}
            sx={{ borderRadius: 1.5, textTransform: 'none' }}
          >
            添加
          </Button>
        </Box>
      </Box>

      {/* 保存按钮 */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          sx={{ borderRadius: 2, px: 3, py: 1 }}
        >
          {saving ? '保存中...' : '保存'}
        </Button>
      </Box>

      {/* 提示框 */}
      <Snackbar
        open={message.open}
        autoHideDuration={3000}
        onClose={closeMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={closeMessage}
          severity={message.type}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {message.text}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ApplicationBasicInfo;

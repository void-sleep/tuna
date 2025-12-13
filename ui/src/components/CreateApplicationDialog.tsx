import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { Application } from '../api/Modules';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import FestivalIcon from '@mui/icons-material/Festival';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import EngineeringIcon from '@mui/icons-material/Engineering';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { getIconBackground } from './ApplicationCard';

interface CreateApplicationDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (appData: Partial<Application>) => void;
  loading?: boolean;
}

// 可选的应用图标
const APP_ICONS = [
  { icon: <SmartToyIcon />, name: '机器人', color: '#3f51b5' },
  { icon: <RestaurantIcon />, name: '餐饮', color: '#ff9800' },
  { icon: <SportsEsportsIcon />, name: '游戏', color: '#9c27b0' },
  { icon: <TravelExploreIcon />, name: '探索', color: '#03a9f4' },
  { icon: <EngineeringIcon />, name: '工程', color: '#4caf50' },
  { icon: <FestivalIcon />, name: '娱乐', color: '#f50057' }
];

/**
 * 创建应用的弹出对话框
 */
const CreateApplicationDialog: React.FC<CreateApplicationDialogProps> = ({
  open,
  onClose,
  onSubmit,
  loading = false
}) => {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [nameError, setNameError] = React.useState('');
  const [selectedIconIndex, setSelectedIconIndex] = React.useState(0);

  // 重置表单
  const resetForm = () => {
    setName('');
    setDescription('');
    setNameError('');
    setSelectedIconIndex(0);
  };

  // 处理关闭
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // 处理提交
  const handleSubmit = () => {
    // 验证名称
    if (!name.trim()) {
      setNameError('应用名称不能为空');
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      tags: [],
      // 这里只是存储图标索引，实际可以扩展为存储图标类型
      logo: selectedIconIndex.toString()
    });

    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.07)'
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {APP_ICONS[selectedIconIndex].icon}
          <Typography sx={{ ml: 1, fontWeight: 500 }}>创建新应用</Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          size="small"
          sx={{ color: 'text.secondary' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          borderColor: 'rgba(0, 0, 0, 0.06)'
        }}
      >
        <Box sx={{ py: 1 }}>
          {/* 图标选择器 */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 1.5, fontSize: '0.875rem' }}
            >
              选择应用图标
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {APP_ICONS.map((iconObj, index) => (
                <Tooltip title={iconObj.name} key={index}>
                  <Avatar
                    sx={{
                      bgcolor: getIconBackground(index),
                      color: iconObj.color,
                      cursor: 'pointer',
                      border: index === selectedIconIndex ? `2px solid ${iconObj.color}` : 'none',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }
                    }}
                    onClick={() => setSelectedIconIndex(index)}
                  >
                    {React.cloneElement(iconObj.icon, { sx: { fontSize: 24 } })}
                  </Avatar>
                </Tooltip>
              ))}
            </Box>
          </Box>

          <TextField
            autoFocus
            margin="dense"
            id="app-name"
            label="应用名称"
            placeholder="输入应用名称"
            fullWidth
            variant="outlined"
            value={name}
            onChange={e => {
              setName(e.target.value);
              if (e.target.value.trim()) {
                setNameError('');
              }
            }}
            error={!!nameError}
            helperText={nameError}
            required
            sx={{ mb: 3 }}
          />

          <TextField
            margin="dense"
            id="app-description"
            label="应用描述"
            placeholder="输入应用描述（可选）"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          color="inherit"
          disabled={loading}
          sx={{
            borderRadius: 2,
            borderColor: 'rgba(0, 0, 0, 0.12)'
          }}
        >
          取消
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disableElevation
          disabled={loading}
          sx={{ borderRadius: 2, ml: 1 }}
        >
          {loading ? '创建中...' : '创建'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateApplicationDialog;

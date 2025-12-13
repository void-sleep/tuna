import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import FestivalIcon from '@mui/icons-material/Festival';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import EngineeringIcon from '@mui/icons-material/Engineering';
import { Application } from '../api/Modules';

interface ApplicationCardProps {
  application: Application;
  index: number;
  onCardClick?: () => void;
  onEdit?: (app: Application) => void;
  onDelete?: (app: Application) => void;
}

/**
 * 获取应用图标
 */
export const getAppIcon = (index: number, logoId?: string) => {
  // 如果有logoId，尝试转换为索引
  const iconIndex = logoId ? parseInt(logoId, 10) : index;
  // 确保索引有效
  const safeIndex = isNaN(iconIndex) ? index % 6 : iconIndex % 6;

  const colors = ['#3f51b5', '#ff9800', '#9c27b0', '#03a9f4', '#4caf50', '#f50057'];
  const icons = [
    <SmartToyIcon key="icon-0" sx={{ fontSize: 36, color: colors[0] }} />,
    <RestaurantIcon key="icon-1" sx={{ fontSize: 36, color: colors[1] }} />,
    <SportsEsportsIcon key="icon-2" sx={{ fontSize: 36, color: colors[2] }} />,
    <TravelExploreIcon key="icon-3" sx={{ fontSize: 36, color: colors[3] }} />,
    <EngineeringIcon key="icon-4" sx={{ fontSize: 36, color: colors[4] }} />,
    <FestivalIcon key="icon-5" sx={{ fontSize: 36, color: colors[5] }} />
  ];
  return icons[safeIndex];
};

/**
 * 获取图标背景色
 */
export const getIconBackground = (index: number, logoId?: string) => {
  // 如果有logoId，尝试转换为索引
  const iconIndex = logoId ? parseInt(logoId, 10) : index;
  // 确保索引有效
  const safeIndex = isNaN(iconIndex) ? index % 6 : iconIndex % 6;

  const backgrounds = [
    'rgba(63, 81, 181, 0.1)',
    'rgba(255, 152, 0, 0.1)',
    'rgba(156, 39, 176, 0.1)',
    'rgba(3, 169, 244, 0.1)',
    'rgba(76, 175, 80, 0.1)',
    'rgba(233, 30, 99, 0.1)'
  ];
  return backgrounds[safeIndex];
};

/**
 * 应用卡片组件
 */
const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  index,
  onCardClick,
  onEdit,
  onDelete
}) => {
  // 菜单状态
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // 打开菜单
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  // 关闭菜单
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // 菜单项点击处理
  const handleEdit = () => {
    handleMenuClose();
    if (onEdit) onEdit(application);
  };

  const handleDelete = () => {
    handleMenuClose();
    if (onDelete) onDelete(application);
  };

  // 处理描述点击
  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick();
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'rgba(0, 0, 0, 0.06)',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: 'rgba(0, 0, 0, 0.09)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardActionArea onClick={handleCardClick}>
        {/* Card header with icon and title */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: getIconBackground(index, application.logo),
              mr: 1.5
            }}
          >
              {getAppIcon(index, application.logo)}
          </Box>
          <Box sx={{ ml: 1 }}>
            <Typography sx={{ fontSize: '1rem' }}>{application.name}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 140px)' }}>
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="body2" color="text.secondary">
                {application.description || application.name}
              </Typography>
            </Box>
        </Box>
      </CardActionArea>
      {/* Card footer with tags and action button */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid rgba(0, 0, 0, 0.03)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="caption">{application.tags?.join(' ')}</Typography>
        </Box>
        <IconButton size="small" onClick={handleMenuOpen} sx={{ color: 'text.secondary' }}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Card menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 180, borderRadius: 1 } } }}
      >
        <MenuItem onClick={handleEdit} sx={{ fontSize: '0.875rem' }}>
          编辑
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main', fontSize: '0.875rem' }}>
          删除
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default ApplicationCard;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Avatar,
  Typography,
  Menu,
  MenuItem,
  Button,
  CircularProgress,
  Divider
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { getCurrentUser } from '../api/UserApi';
import { User, ANONYMOUS_USER } from '../api/Modules';

interface UserInfoProps {
  /**
   * 用户信息组件的样式
   */
  sx?: object;
}

const UserInfo: React.FC<UserInfoProps> = ({ sx }) => {
  const [user, setUser] = useState<User>(ANONYMOUS_USER);
  const [loading, setLoading] = useState<boolean>(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to load current user:', error);
      setUser(ANONYMOUS_USER);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getDisplayName = () => user.displayName ?? user.username ?? '游客';

  const getAvatarText = () => {
    return getDisplayName().charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', ...sx }}>
        <CircularProgress size={20} color="inherit" />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', ...sx }}>
      <Button
        onClick={handleClick}
        sx={{
          color: 'inherit',
          textTransform: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          padding: '4px 8px',
          borderRadius: 1,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        <Avatar
          sx={{
            width: 28,
            height: 28,
            fontSize: '0.875rem',
          }}
        >
          {getAvatarText()}
        </Avatar>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        elevation={3}
        sx={{
          '& .MuiPaper-root': {
            minWidth: 200,
            mt: 1
          }
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {getDisplayName()}
          </Typography>
          {user.email && (
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
          )}
          {user.isAnonymous && (
            <Typography variant="body2" color="text.secondary">
              未登录状态
            </Typography>
          )}
        </Box>
        <Divider />
        <MenuItem onClick={handleClose}>
          <PersonIcon sx={{ mr: 1 }} />
          个人信息
        </MenuItem>
        {!user.isAnonymous && (
          <MenuItem onClick={handleClose}>
            <ExitToAppIcon sx={{ mr: 1 }} />
            退出登录
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default UserInfo; 
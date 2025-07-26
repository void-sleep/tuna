import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { createRandomEmoji } from '../api/ShakeApi';
import { Recipe } from '../api/Modules';
import './ShakeDataDetail.css';

interface ShakeDataDetailProps {
  open: boolean;
  handleClose: () => void;
  data: Recipe;
}

// 颜色调色板，用于标签显示
const colorPalette = [
  '#FF6B6B', // 红色
  '#4ECDC4', // 青色
  '#45B7D1', // 蓝色
  '#96CEB4', // 绿色
  '#FFBE0B' // 黄色
];

export default function ShakeDataDetail({ open, handleClose, data }: ShakeDataDetailProps) {
  // 生成随机表情
  const randomEmoji = createRandomEmoji();

  // 确保数据存在
  if (!data) {
    return null;
  }

  // 处理对话框关闭事件
  const handleDialogClose = (
    event: React.SyntheticEvent,
    reason: 'backdropClick' | 'escapeKeyDown'
  ) => {
    // 只有通过关闭按钮关闭，不允许点击背景或按ESC关闭
    if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
      handleClose();
    }
  };

  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
      onClose={handleDialogClose}
      slotProps={{
        backdrop: {
          className: 'recipe-detail-dialog'
        },
        paper: {
          className: 'recipe-detail-paper'
        }
      }}
    >
      <DialogTitle className="recipe-detail-title-container">
        <IconButton aria-label="关闭" onClick={handleClose} className="recipe-detail-close-button">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box className="recipe-detail-content">
          <Box className="recipe-detail-header" data-emoji={randomEmoji}>
            <Typography variant="h3" className="recipe-detail-name">
              {data.name}
            </Typography>
            {data.description && (
              <Typography variant="body1" className="recipe-detail-description">
                {data.description}
              </Typography>
            )}
          </Box>

          <Box className="recipe-detail-tags">
            {data.tags?.map((tag: string, index: number) => (
              <Chip
                key={index}
                label={tag}
                variant="outlined"
                className="recipe-detail-tag"
                style={{
                  borderColor: colorPalette[(index + 1) % colorPalette.length],
                  color: colorPalette[(index + 1) % colorPalette.length]
                }}
              />
            ))}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

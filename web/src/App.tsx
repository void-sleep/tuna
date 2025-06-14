import './App.css';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import GitHubIcon from '@mui/icons-material/GitHub';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import ExploreIcon from '@mui/icons-material/Explore';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';

import ApplicationShake from './components/ApplicationShake';
import ApplicationsPage from './components/ApplicationsPage';
import ExplorePage from './components/ExplorePage';
import ApplicationEditor from './components/ApplicationEditor';
import UserInfo from './components/UserInfo';
import { useColorMode } from './theme/ThemeContext';
import logoImage from './logo.svg';

function App() {
  const navigate = useNavigate();
  const { toggleColorMode, mode } = useColorMode();

  const handleNavigate = (section: 'shake' | 'apps' | 'explore' | 'new' | string) => {
    if (section === 'shake') {
      navigate('/shake');
    } else if (section === 'apps') {
      navigate('/');
    } else if (section === 'explore') {
      navigate('/explore');
    } else if (section === 'new') {
      navigate('/apps/new');
    } else if (section.startsWith('app/')) {
      navigate(`/${section}`);
    }
  };

  return (
    <div className="App">
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer'
              }}
              onClick={() => handleNavigate('apps')}
            >
              <img
                src={logoImage}
                alt="Logo"
                style={{
                  height: 32,
                  marginRight: 8
                }}
              />
              <Typography variant="h6" component="div">
                庄周吃鱼
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Button
                size="large"
                color="inherit"
                startIcon={<AutoModeIcon />}
                onClick={() => handleNavigate('apps')}
                sx={{ mx: 3 }}
              >
                应用
              </Button>
              <Button
                size="large"
                color="inherit"
                startIcon={<ExploreIcon />}
                onClick={() => handleNavigate('explore')}
                sx={{ mx: 3 }}
              >
                探索
              </Button>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>

              <Link
                color="inherit"
                href="https://github.com/void-sleep/"
                target="_blank"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mx: 1
                }}
              >
                <GitHubIcon />
              </Link>
              <IconButton
                onClick={toggleColorMode}
                color="inherit"
                title={mode === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
              >
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
              <UserInfo />
            </Box>
          </Toolbar>
        </AppBar>
      </Box>

      <Routes>
        <Route
          path="/"
          element={
            <ApplicationsPage
              onNewClick={() => handleNavigate('new')}
              onAppClick={id => handleNavigate(`app/${id}`)}
              _onNavigateToShake={() => handleNavigate('shake')}
            />
          }
        />
        <Route path="/apps/:appId" element={<ApplicationEditor />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/shake" element={<ApplicationShake />} />
        <Route path="/shake/:appId" element={<ApplicationShake />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;

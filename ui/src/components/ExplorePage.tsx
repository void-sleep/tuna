import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Chip from '@mui/material/Chip';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import PolicyIcon from '@mui/icons-material/Policy';
import TuneIcon from '@mui/icons-material/Tune';
import ExploreIcon from '@mui/icons-material/Explore';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Divider from '@mui/material/Divider';

import { ExploreApi, Scenario, Collection, Policy, PopularApplication } from '../api/ExploreApi';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`explore-tabpanel-${index}`}
      aria-labelledby={`explore-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `explore-tab-${index}`,
    'aria-controls': `explore-tabpanel-${index}`
  };
}

// Get icon component based on iconType
const getIconComponent = (iconType: string, color: string) => {
  switch (iconType) {
    case 'restaurant':
      return <RestaurantIcon sx={{ fontSize: 30, color }} />;
    case 'explore':
      return <ExploreIcon sx={{ fontSize: 30, color }} />;
    case 'tune':
      return <TuneIcon sx={{ fontSize: 30, color }} />;
    case 'whatshot':
      return <WhatshotIcon sx={{ fontSize: 30, color }} />;
    case 'favorite':
      return <FavoriteIcon sx={{ fontSize: 30, color }} />;
    default:
      return <ExploreIcon sx={{ fontSize: 30, color }} />;
  }
};

export default function ExplorePage() {
  const [tabValue, setTabValue] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [scenarios, setScenarios] = React.useState<Scenario[]>([]);
  const [collections, setCollections] = React.useState<Collection[]>([]);
  const [policies, setPolicies] = React.useState<Policy[]>([]);
  const [popularApps, setPopularApps] = React.useState<PopularApplication[]>([]);

  // Load initial data
  React.useEffect(() => {
    setScenarios(ExploreApi.getRecommendedScenarios());
    setCollections(ExploreApi.getPopularCollections());
    setPolicies(ExploreApi.getPopularPolicies());
    setPopularApps(ExploreApi.getPopularApplications());
  }, []);

  // Handle search
  React.useEffect(() => {
    if (searchQuery.trim() === '') {
      // Reset to all data if search is empty
      setScenarios(ExploreApi.getRecommendedScenarios());
      setCollections(ExploreApi.getPopularCollections());
      setPolicies(ExploreApi.getPopularPolicies());
      setPopularApps(ExploreApi.getPopularApplications());
    } else {
      // Filter data based on search query
      const results = ExploreApi.searchMarketplace(searchQuery);
      setScenarios(results.scenarios);
      setCollections(results.collections);
      setPolicies(results.policies);
      setPopularApps(results.applications);
    }
  }, [searchQuery]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  return (
    <Box sx={{ p: { xs: 3, md: 5 }, maxWidth: 1400, mx: 'auto' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 4
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 400,
            color: 'text.primary',
            letterSpacing: '-0.5px',
            mb: { xs: 2, sm: 0 }
          }}
        >
          探索(Coming Soon)
        </Typography>

        <Paper
          elevation={0}
          sx={{
            p: '0px 16px',
            display: 'flex',
            alignItems: 'center',
            width: { xs: '100%', sm: 280 },
            height: 44,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            '&:hover': {
              borderColor: 'action.hover'
            }
          }}
        >
          <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
          <InputBase
            sx={{ flex: 1 }}
            placeholder="搜索插件与应用"
            inputProps={{ 'aria-label': '搜索插件与应用' }}
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </Paper>
      </Box>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="explore tabs"
            sx={{
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0'
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '1rem',
                px: 3
              }
            }}
          >
            <Tab label="推荐场景" {...a11yProps(0)} />
            <Tab label="插件市场" {...a11yProps(1)} />
            <Tab label="热门应用" {...a11yProps(2)} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {scenarios.length > 0 ? (
            <Grid container spacing={3}>
              {scenarios.map(scenario => (
                <Grid item xs={12} sm={6} md={4} key={scenario.id}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        borderColor: 'primary.main',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px -10px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <CardActionArea
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start'
                      }}
                    >
                      <CardContent sx={{ width: '100%' }}>
                        <Box
                          sx={{
                            display: 'flex',
                            mb: 2,
                            alignItems: 'center'
                          }}
                        >
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: `${scenario.color}15`, // 15% opacity
                              color: scenario.color,
                              mr: 2
                            }}
                          >
                            {getIconComponent(scenario.iconType, scenario.color)}
                          </Box>
                          <Typography variant="h6" component="div">
                            {scenario.title}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                          {scenario.description}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: 'center',
                borderRadius: 3,
                border: '1px dashed',
                borderColor: 'divider',
                bgcolor: 'background.default'
              }}
            >
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                没有找到匹配的场景
              </Typography>
            </Paper>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {collections.length > 0 || policies.length > 0 ? (
            <>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, mt: 2, mb: 3 }}>
                  热门食谱集合
                </Typography>
                <Grid container spacing={2}>
                  {collections.map(collection => (
                    <Grid item xs={12} sm={6} md={3} key={collection.id}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                          '&:hover': {
                            borderColor: 'primary.light',
                            bgcolor: 'rgba(0, 0, 0, 0.01)'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ mr: 1, color: '#4caf50' }}>
                            <CollectionsBookmarkIcon />
                          </Box>
                          <Typography variant="subtitle1">{collection.title}</Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          包含 {collection.count} 个食谱
                        </Typography>
                        {collection.creatorName && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mt: 1 }}
                          >
                            创建者: {collection.creatorName}
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {policies.length > 0 && (
                <>
                  <Divider sx={{ my: 4 }} />

                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, mb: 3 }}>
                      热门策略
                    </Typography>
                    <Grid container spacing={2}>
                      {policies.map(policy => (
                        <Grid item xs={12} sm={6} md={3} key={policy.id}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: 'divider',
                              transition: 'all 0.2s ease',
                              cursor: 'pointer',
                              '&:hover': {
                                borderColor: 'primary.light',
                                bgcolor: 'rgba(0, 0, 0, 0.01)'
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box sx={{ mr: 1, color: '#3f51b5' }}>
                                <PolicyIcon />
                              </Box>
                              <Typography variant="subtitle1">{policy.title}</Typography>
                            </Box>
                            {policy.description && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {policy.description}
                              </Typography>
                            )}
                            <Box
                              sx={{
                                display: 'flex',
                                mt: 1,
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <Chip
                                label="策略"
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.7rem',
                                  bgcolor: 'rgba(63, 81, 181, 0.1)',
                                  color: '#3f51b5'
                                }}
                              />
                              {policy.creatorName && (
                                <Typography variant="caption" color="text.secondary">
                                  {policy.creatorName}
                                </Typography>
                              )}
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </>
              )}
            </>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: 'center',
                borderRadius: 3,
                border: '1px dashed',
                borderColor: 'divider',
                bgcolor: 'background.default'
              }}
            >
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                没有找到匹配的插件
              </Typography>
            </Paper>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {popularApps.length > 0 ? (
            <Grid container spacing={3}>
              {popularApps.map(app => (
                <Grid item xs={12} sm={6} md={3} key={app.id}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        borderColor: 'primary.main',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px -10px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <CardActionArea
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start'
                      }}
                    >
                      <CardContent sx={{ width: '100%' }}>
                        <Typography gutterBottom variant="h6" component="div">
                          {app.title}
                        </Typography>
                        {app.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {app.description}
                          </Typography>
                        )}
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mt: 2
                          }}
                        >
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body2" color="text.secondary">
                              创建者: {app.creator}
                            </Typography>
                            {app.category && (
                              <Chip
                                label={app.category}
                                size="small"
                                sx={{
                                  mt: 1,
                                  height: 24,
                                  fontSize: '0.75rem',
                                  borderRadius: '12px',
                                  bgcolor: 'background.default',
                                  color: 'text.secondary'
                                }}
                              />
                            )}
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <FavoriteIcon sx={{ fontSize: 16, color: '#f50057', mr: 0.5 }} />
                            <Typography variant="body2" color="text.secondary">
                              {app.likes}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: 'center',
                borderRadius: 3,
                border: '1px dashed',
                borderColor: 'divider',
                bgcolor: 'background.default'
              }}
            >
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                没有找到匹配的应用
              </Typography>
            </Paper>
          )}
        </TabPanel>
      </Box>
    </Box>
  );
}

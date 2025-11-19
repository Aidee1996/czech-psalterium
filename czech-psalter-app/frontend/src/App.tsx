import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';

import ClusterView from './components/ClusterView';
import ComparisonView from './components/ComparisonView';
import StatisticsView from './components/StatisticsView';
import SearchPanel from './components/SearchPanel';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
});

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
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Czech Psalter Manuscripts Visualization
            </Typography>
            <Typography variant="subtitle2" sx={{ fontStyle: 'italic' }}>
              Medieval Czech Psalter Comparative Analysis
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Paper elevation={3}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="psalter visualization tabs"
              centered
            >
              <Tab label="Cluster Analysis" />
              <Tab label="Text Comparison" />
              <Tab label="Statistics & Profiles" />
            </Tabs>
          </Paper>

          <TabPanel value={tabValue} index={0}>
            <ClusterView />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <ComparisonView />
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <StatisticsView />
          </TabPanel>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;

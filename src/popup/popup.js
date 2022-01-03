import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import SwipeableViews from 'react-swipeable-views';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import SettingsIcon from '@mui/icons-material/Settings';
import SettingsPage from './SettingsPage';
import BirdPage from './BirdPage';
import { PopupContainer, TabPanelContainer, theme } from './styles';
import { localURL } from '../contentScripts/utils';

const Popup = () => {
  const [currentTab, setCurrentTab] = useState(0);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PopupContainer>
        <AppBar position="static">
          <Tabs
            value={currentTab}
            onChange={(e, newVal) => setCurrentTab(newVal)}
            indicatorColor="secondary"
            textColor="inherit"
            variant="fullWidth"
          >
            <Tab
              label={
                <img
                  src={localURL('images/binoculars.png')}
                  style={{ height: '32px' }}
                />
              }
              style={{ padding: 0 }}
            />
            <Tab label={<SettingsIcon />} style={{ padding: 0 }} />
          </Tabs>
        </AppBar>
        <SwipeableViews
          axis={'x'}
          index={currentTab}
          onChangeIndex={newVal => setCurrentTab(newVal)}
          style={{ width: '100%' }}
          containerStyle={{
            transition: 'transform 0.35s cubic-bezier(0.15, 0.3, 0.25, 1) 0s',
          }}
        >
          <TabPanel value={currentTab} index={0}>
            <BirdPage />
          </TabPanel>
          <TabPanel value={currentTab} index={1}>
            <SettingsPage />
          </TabPanel>
        </SwipeableViews>
      </PopupContainer>
    </ThemeProvider>
  );
};

const TabPanel = props => {
  const { children, value, index } = props;

  return (
    <TabPanelContainer hidden={value !== index}>
      {value === index && children}
    </TabPanelContainer>
  );
};

ReactDOM.render(<Popup />, document.getElementById('app-root'));

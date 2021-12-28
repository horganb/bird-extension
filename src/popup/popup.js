import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import { localURL } from '../contentScripts/utils';
import CssBaseline from '@mui/material/CssBaseline';
import { cyan, pink } from '@mui/material/colors';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import SwipeableViews from 'react-swipeable-views';
import { defaultSettings } from '../defaultSettings';

const PopupContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  border: `4px ridge ${theme.palette.primary.light}`,
  backgroundColor: '#f0fdff',
  width: '300px',
}));

const BirdInspectorContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const CheckboxContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  whiteSpace: 'nowrap',
}));

const TabPanelContainer = styled('div')(({ theme }) => ({
  padding: '0.5rem',
}));

const theme = createTheme({
  palette: {
    primary: cyan,
    secondary: pink,
  },
  typography: {
    fontFamily: ['Domine'],
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: "Domine";
          src: url(${localURL(
            'fonts/Domine/Domine-VariableFont_wght.ttf'
          )}) format("truetype");
        }
      `,
    },
  },
});

const EnableSwitch = ({ defaults }) => {
  const [settings, setSettings] = useState(defaults);
  const [birdImageURL, setBirdImageURL] = useState();
  const [birdTransform, setBirdTransform] = useState();
  const [birdName, setBirdName] = useState();
  const [birdSpecies, setBirdSpecies] = useState();
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      var port = chrome.tabs.connect(tabs[0].id, { name: 'birdInspector' });
      port.postMessage({ getBird: true });
      port.onMessage.addListener(msg => {
        setBirdImageURL(msg.image);
        setBirdTransform(msg.transform);
        setBirdName(msg.name);
        setBirdSpecies(msg.species);
        port.postMessage({ getBird: true });
      });
    });
  }, []);

  const changeSetting = (setting, value) => {
    chrome.storage.local.set({ [setting]: value }, () => {
      setSettings(oldSettings => ({ ...oldSettings, [setting]: value }));
    });
    chrome.tabs.query({}, tabs => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { [setting]: value });
      });
    });
  };

  const renderToggle = (settingID, enabledDescription, disabledDescription) => {
    return (
      <FormControlLabel
        control={
          <Switch
            checked={settings[settingID]}
            onChange={e => changeSetting(settingID, e.target.checked)}
          />
        }
        label={settings[settingID] ? enabledDescription : disabledDescription}
      />
    );
  };

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
            <Tab label="Inspector" />
            <Tab label="Settings" />
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
            {birdName ? (
              <BirdInspectorContainer>
                <h2 style={{ margin: 0 }}>{birdName}</h2>
                <h4 style={{ margin: 0, fontStyle: 'italic' }}>
                  {birdSpecies}
                </h4>
                <img
                  src={birdImageURL}
                  style={{
                    transform: birdTransform,
                    width: '40px',
                    height: 'auto',
                  }}
                />
              </BirdInspectorContainer>
            ) : (
              <p
                style={{
                  opacity: 0.8,
                  fontStyle: 'italic',
                  textAlign: 'center',
                }}
              >
                Birds will show up here once they're on your screen!
              </p>
            )}
          </TabPanel>
          <TabPanel value={currentTab} index={1}>
            <CheckboxContainer>
              {renderToggle('enabled', 'Birds Enabled', 'Birds Disabled')}
              {renderToggle(
                'soundsEnabled',
                'Sounds Enabled',
                'Sounds Disabled'
              )}
              {renderToggle(
                'flyFromCursor',
                'Birds Fly From Cursor',
                "Birds Don't Fly From Cursor"
              )}
            </CheckboxContainer>
          </TabPanel>
        </SwipeableViews>
      </PopupContainer>
    </ThemeProvider>
  );
};

chrome.storage.local.get(defaultSettings, settingValues => {
  ReactDOM.render(
    <EnableSwitch defaults={settingValues} />,
    document.getElementById('app-root')
  );
});

const TabPanel = props => {
  const { children, value, index } = props;

  return (
    <TabPanelContainer hidden={value !== index}>
      {value === index && children}
    </TabPanelContainer>
  );
};

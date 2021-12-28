import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { localURL } from '../contentScripts/utils';
import SwipeableViews from 'react-swipeable-views';
import { defaultSettings } from '../defaultSettings';

import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import { cyan, pink } from '@mui/material/colors';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

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
  justifyContent: 'space-between',
}));

const BirdDetailsContainer = styled('div')(({ theme }) => ({
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

const Popup = ({ defaults }) => {
  const [settings, setSettings] = useState(defaults);
  const [birdImageURL, setBirdImageURL] = useState();
  const [birdTransform, setBirdTransform] = useState();
  const [birdName, setBirdName] = useState();
  const [birdSpecies, setBirdSpecies] = useState();
  const [currentTab, setCurrentTab] = useState(0);
  const [birdIndex, setBirdIndex] = useState(0);
  const [numBirds, setNumBirds] = useState(0);

  const birdInspectorPort = useRef();

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      birdInspectorPort.current = chrome.tabs.connect(tabs[0].id, {
        name: 'birdInspector',
      });
      birdInspectorPort.current.postMessage({ getBird: true });
      birdInspectorPort.current.onMessage.addListener(msg => {
        setBirdImageURL(msg.image);
        setBirdTransform(msg.transform);
        setBirdName(msg.name);
        setBirdSpecies(msg.species);
        setBirdIndex(msg.index);
        setNumBirds(msg.numBirds);
        birdInspectorPort.current.postMessage({ getBird: true });
      });
    });
  }, []);

  const leftBird = () => {
    birdInspectorPort.current?.postMessage({ left: true });
  };

  const rightBird = () => {
    birdInspectorPort.current?.postMessage({ right: true });
  };

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
                <IconButton onClick={leftBird}>
                  <ChevronLeftIcon />
                </IconButton>
                <BirdDetailsContainer>
                  <h5 style={{ margin: 0, textAlign: 'center' }}>
                    {birdIndex + 1}/{numBirds}
                  </h5>
                  <h2 style={{ margin: 0, textAlign: 'center' }}>{birdName}</h2>
                  <h4
                    style={{
                      margin: 0,
                      textAlign: 'center',
                      fontStyle: 'italic',
                    }}
                  >
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
                </BirdDetailsContainer>
                <IconButton onClick={rightBird}>
                  <ChevronRightIcon />
                </IconButton>
              </BirdInspectorContainer>
            ) : (
              <p
                style={{
                  opacity: 0.8,
                  fontStyle: 'italic',
                  textAlign: 'center',
                }}
              >
                Birds will visit soon! Hang in there!
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
    <Popup defaults={settingValues} />,
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

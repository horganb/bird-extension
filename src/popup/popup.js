import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import { localURL } from '../contentScripts/utils';
import CssBaseline from '@mui/material/CssBaseline';
import { cyan } from '@mui/material/colors';
import { defaultSettings } from '../defaultSettings';

const CheckboxContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  whiteSpace: 'nowrap',
  border: `3px outset ${theme.palette.primary.light}`,
  backgroundColor: '#f0fdff',
  padding: '0.5rem',
}));

const theme = createTheme({
  palette: {
    primary: cyan,
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
      <CheckboxContainer>
        {renderToggle('enabled', 'Birds Enabled', 'Birds Disabled')}
        {renderToggle('soundsEnabled', 'Sounds Enabled', 'Sounds Disabled')}
        {renderToggle(
          'flyFromCursor',
          'Birds Fly From Cursor',
          "Birds Don't Fly From Cursor"
        )}
      </CheckboxContainer>
    </ThemeProvider>
  );
};

chrome.storage.local.get(defaultSettings, settingValues => {
  ReactDOM.render(
    <EnableSwitch defaults={settingValues} />,
    document.getElementById('app-root')
  );
});

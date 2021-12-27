import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import { localURL } from '../contentScripts/utils';
import CssBaseline from '@mui/material/CssBaseline';
import { cyan } from '@mui/material/colors';

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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CheckboxContainer>
        <FormControlLabel
          control={
            <Switch
              checked={settings.enabled}
              onChange={e => changeSetting('enabled', e.target.checked)}
            />
          }
          label={settings.enabled ? 'Birds Enabled' : 'Birds Disabled'}
        />
        <FormControlLabel
          control={
            <Switch
              checked={settings.soundsEnabled}
              onChange={e => changeSetting('soundsEnabled', e.target.checked)}
            />
          }
          label={settings.soundsEnabled ? 'Sounds Enabled' : 'Sounds Disabled'}
        />
      </CheckboxContainer>
    </ThemeProvider>
  );
};

chrome.storage.local.get(null, settingValues => {
  ReactDOM.render(
    <EnableSwitch defaults={settingValues} />,
    document.getElementById('app-root')
  );
});

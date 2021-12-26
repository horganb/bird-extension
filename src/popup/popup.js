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
  alignItems: 'center',
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

const EnableSwitch = ({ defaultEnabled }) => {
  const [enabled, setEnabled] = useState(defaultEnabled);

  const setChecked = newChecked => {
    chrome.storage.local.set({ enabled: newChecked }, () => {
      setEnabled(newChecked);
    });
    chrome.tabs.query({}, tabs => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { enabled: newChecked });
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
              checked={enabled}
              onChange={e => setChecked(e.target.checked)}
            />
          }
          label={enabled ? 'Birds Enabled' : 'Birds Disabled'}
        />
      </CheckboxContainer>
    </ThemeProvider>
  );
};

chrome.storage.local.get(['enabled'], ({ enabled }) => {
  ReactDOM.render(
    <EnableSwitch defaultEnabled={enabled} />,
    document.getElementById('app-root')
  );
});

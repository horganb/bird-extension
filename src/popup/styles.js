import { localURL } from '../contentScripts/utils';
import { createTheme, styled } from '@mui/material/styles';
import { cyan, pink } from '@mui/material/colors';

export const theme = createTheme({
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

export const PopupContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  border: `4px ridge ${theme.palette.primary.light}`,
  backgroundColor: '#f0fdff',
  width: '300px',
}));

export const BirdInspectorContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
}));

export const CenteredFlexColumn = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

export const CheckboxContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  whiteSpace: 'nowrap',
}));

export const TabPanelContainer = styled('div')(({ theme }) => ({
  padding: '0.5rem',
}));

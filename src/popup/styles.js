import { localURL } from '../contentScripts/utils';
import { createTheme, styled } from '@mui/material/styles';
import { cyan, pink } from '@mui/material/colors';
import { ToggleButton } from '@mui/material';

export const theme = createTheme({
  palette: {
    primary: cyan,
    secondary: pink,
  },
  typography: {
    fontFamily: ['Quicksand'],
    body1: {
      fontWeight: 500,
    },
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
        @font-face {
          font-family: "Quicksand";
          src: url(
            'fonts/Quicksand/static/Quicksand-Regular.ttf'
          ) format("truetype");
        }
      `,
    },
  },
});

export const PopupContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: '#f0fdff',
  width: '300px',
}));

export const BirdInspectorContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  fontFamily: 'Domine',
}));

export const EncyclopediaContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  fontFamily: 'Domine',
}));

export const AllBirdsContainer = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  alignItems: 'center',
  padding: '9px',
  // gap: '12px',
}));

export const CenteredFlexColumn = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

export const BirdInfoContainer = styled(CenteredFlexColumn)(({ toShow }) => ({
  maxHeight: toShow ? '10rem' : '0',
  transition: 'max-height 0.3s',
  overflow: 'hidden',
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

export const WideToggleButton = styled(ToggleButton)(() => ({
  padding: '0 11px',
}));

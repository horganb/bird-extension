import { createTheme, styled } from '@mui/material/styles';
import { pink } from '@mui/material/colors';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#38dbf0',
    },
    secondary: pink,
  },
  typography: {
    fontFamily: ['Quicksand'],
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: "Domine";
          src: url(
            'fonts/Domine/Domine-VariableFont_wght.ttf'
          ) format("truetype");
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

export const AppContainer = styled('div')(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'url(images/bg.png) repeat',
  animationName: 'MOVE-BG',
  animationDuration: '50s',
  animationTimingFunction: 'linear',
  animationIterationCount: 'infinite',
}));

export const InfoContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  boxShadow: '0 0 18px 0px #595959',
  backgroundColor: '#f0fdff',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4.75rem',
  paddingTop: '2.85rem',
  maxWidth: '850px',
}));

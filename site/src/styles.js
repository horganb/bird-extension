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
          src: url(
            'fonts/Domine/Domine-VariableFont_wght.ttf'
          ) format("truetype");
        }
      `,
    },
  },
});

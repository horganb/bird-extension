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
  alignItems: 'center',
  fontFamily: 'Domine',
}));

export const EncyclopediaContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  margin: '-.5rem',
}));

export const AllBirdsPageContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
}));

export const AllBirdsContainer = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gridAutoRows: '1fr',
  alignItems: 'center',
  padding: '15px 0',
  marginBottom: '0.5rem',
}));

export const CenteredFlexColumn = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

export const BirdInfoResizeContainer = styled(CenteredFlexColumn)(
  ({ theme, toShow }) => ({
    maxHeight: toShow ? '20rem' : '0',
    transition: 'max-height 0.3s',
    overflow: 'hidden',
    backgroundColor: '#d8faff',
    width: '100%',
  })
);

export const BirdInfoContainer = styled('div')(() => ({
  width: '100%',
  padding: '15px',
}));

export const BirdTitleContainer = styled('div')(() => ({
  fontFamily: 'Domine',
  paddingBottom: '10px',
}));

export const FactsContainer = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px',
  paddingRight: '16px',
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

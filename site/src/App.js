import {
  Button,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import ExtensionIcon from '@mui/icons-material/Extension';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/system';
import React, { useState } from 'react';

import './App.css';
import { AppContainer, InfoContainer, theme } from './styles';
import { isEdgeBrowser } from './utils';

const CustomStepper = ({ steps }) => {
  const [activeStep, setActiveStep] = useState(0);

  const lastStep = steps.length - 1;

  return (
    <Stepper activeStep={activeStep} orientation="vertical">
      {steps.map(({ title, content }, index) => {
        return (
          <Step key={index} expanded completed={false}>
            <StepLabel>
              <Typography variant="h5" style={{ fontWeight: '600' }}>
                {title}
              </Typography>
            </StepLabel>
            <StepContent style={{ lineHeight: '175%' }}>
              {content}
              {activeStep === index && (
                <Box sx={{ mb: 2 }}>
                  <div>
                    {index < lastStep && (
                      <Button
                        variant="contained"
                        onClick={() => setActiveStep(step => step + 1)}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        Continue
                      </Button>
                    )}
                  </div>
                </Box>
              )}
            </StepContent>
          </Step>
        );
      })}
    </Stepper>
  );
};

const App = () => {
  const steps = [
    {
      title: 'Viewing Birds',
      content: (
        <>
          Click the new <img src="images/icon.png" alt="bird" /> in the top
          right corner of your browser to open the menu.
          <br />
          You can view info about the birds on your screen in the{' '}
          <strong>Inspector</strong>{' '}
          <img
            src="images/binoculars.png"
            alt="binoculars"
            width="20px"
            style={{ verticalAlign: 'sub' }}
          />
          .
          <br />
          Cycle through them with the{' '}
          <ChevronLeftIcon
            fontSize="small"
            style={{ verticalAlign: 'sub' }}
          />{' '}
          and{' '}
          <ChevronRightIcon fontSize="small" style={{ verticalAlign: 'sub' }} />{' '}
          arrows.
        </>
      ),
    },
    {
      title: 'Your Bird Log',
      content: (
        <>
          If you see a bird with{' '}
          <img
            src="images/sparkles.gif"
            alt="sparkles"
            width="24px"
            style={{ verticalAlign: 'sub' }}
          />{' '}
          around it, hover your cursor over it to discover it!
          <br />
          You can access all of the birds you have discovered in your{' '}
          <strong>Bird Log</strong>{' '}
          <img
            src="images/bird.png"
            alt="bird symbol"
            width="20px"
            style={{ verticalAlign: 'sub' }}
          />
          .
        </>
      ),
    },
  ];

  if (!isEdgeBrowser) {
    steps.unshift({
      title: 'Getting Started',
      content: (
        <>
          Click the{' '}
          <ExtensionIcon fontSize="small" style={{ verticalAlign: 'sub' }} />{' '}
          located in the top right corner of your browser.
          <br />
          Then click the{' '}
          <PushPinOutlinedIcon
            fontSize="small"
            style={{ verticalAlign: 'sub' }}
          />{' '}
          next to Birdwatcher.
        </>
      ),
    });
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppContainer>
        <InfoContainer>
          <Typography
            variant="h3"
            style={{ fontWeight: '700', marginBottom: '-10px' }}
          >
            Welcome to
          </Typography>
          <img
            src="images/title.png"
            style={{ paddingBottom: '1rem', width: '28rem' }}
            alt="Birdwatcher"
          />
          <CustomStepper steps={steps} />
        </InfoContainer>
      </AppContainer>
    </ThemeProvider>
  );
};

export default App;

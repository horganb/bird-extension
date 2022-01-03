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
import { theme } from './styles';
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
              <Typography variant="h5">{title}</Typography>
            </StepLabel>
            <StepContent>
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
                    <Button
                      disabled={index === 0}
                      variant="outlined"
                      onClick={() => setActiveStep(step => step - 1)}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Back
                    </Button>
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
          <Typography>
            Click the new &nbsp;
            <img src="images/icon.png" alt="bird" />
            &nbsp; in the top right corner of your browser.
          </Typography>
          <Typography>
            Here you can view info about the birds on your screen!
          </Typography>
          <Typography>
            Cycle through them with &nbsp;
            <ChevronLeftIcon
              fontSize="small"
              style={{ verticalAlign: 'top' }}
            />
            &nbsp; and &nbsp;
            <ChevronRightIcon
              fontSize="small"
              style={{ verticalAlign: 'top' }}
            />
            &nbsp;
          </Typography>
        </>
      ),
    },
  ];

  if (!isEdgeBrowser) {
    steps.unshift({
      title: 'Getting Started',
      content: (
        <>
          <Typography>
            Click the &nbsp;
            <ExtensionIcon fontSize="small" style={{ verticalAlign: 'top' }} />
            &nbsp; located in the top right corner of your browser.
          </Typography>
          <Typography>
            Then click the &nbsp;
            <PushPinOutlinedIcon
              fontSize="small"
              style={{ verticalAlign: 'top' }}
            />
            &nbsp; next to Birdwatcher.
          </Typography>
        </>
      ),
    });
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <Typography variant="h3" style={{ margin: '4rem' }}>
          Welcome to{' '}
          <Typography
            variant="h3"
            style={{ display: 'inline' }}
            color="primary"
          >
            Birdwatcher
          </Typography>
          !
        </Typography>
        <CustomStepper steps={steps} />
      </div>
    </ThemeProvider>
  );
};

export default App;

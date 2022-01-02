import {
  Button,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import ExtensionIcon from '@mui/icons-material/Extension';
import PushPinIcon from '@mui/icons-material/PushPin';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/system';
import React, { useState } from 'react';

import './App.css';
import { theme } from './styles';

function App() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <CssBaseline />
        <Stepper activeStep={activeStep} orientation="vertical">
          <Step>
            <StepLabel>
              <Typography variant="h5">Getting started</Typography>
            </StepLabel>
            <StepContent>
              <Typography>
                Click the &nbsp;
                <ExtensionIcon
                  fontSize="small"
                  style={{ verticalAlign: 'top' }}
                />
                &nbsp; located in the top right corner of your browser.
              </Typography>
              <Typography>
                Then click the &nbsp;
                <PushPinIcon
                  fontSize="small"
                  style={{ verticalAlign: 'top' }}
                />
                &nbsp; next to Birdwatcher.
              </Typography>
              <Box sx={{ mb: 2 }}>
                <div>
                  <Button
                    variant="contained"
                    onClick={() => setActiveStep(1)}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Continue
                  </Button>
                  <Button disabled sx={{ mt: 1, mr: 1 }}>
                    Back
                  </Button>
                </div>
              </Box>
            </StepContent>
          </Step>
          <Step>
            <StepLabel>Moving along! step 2</StepLabel>
            <StepContent>
              <Typography>Description</Typography>
              <Box sx={{ mb: 2 }}>
                <div>
                  <Button
                    disabled
                    variant="contained"
                    onClick={() => setActiveStep(1)}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Continue
                  </Button>
                  <Button
                    onClick={() => setActiveStep(0)}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Back
                  </Button>
                </div>
              </Box>
            </StepContent>
          </Step>
        </Stepper>
      </div>
    </ThemeProvider>
  );
}

export default App;

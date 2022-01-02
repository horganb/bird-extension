import {
  Button,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import React, { useState } from 'react';

import './App.css';

function App() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="App">
      <Stepper activeStep={activeStep} orientation="vertical">
        <Step>
          <StepLabel>Getting started</StepLabel>
          <StepContent>
            <Typography>Description</Typography>
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
                <Button onClick={() => setActiveStep(0)} sx={{ mt: 1, mr: 1 }}>
                  Back
                </Button>
              </div>
            </Box>
          </StepContent>
        </Step>
      </Stepper>
    </div>
  );
}

export default App;

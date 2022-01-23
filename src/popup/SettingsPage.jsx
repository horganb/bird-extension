import React, { useEffect, useState } from 'react';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { defaultSettings } from '../defaultSettings';
import {
  CenteredFlexColumn,
  CheckboxContainer,
  WideToggleButton,
} from './styles';
import { getDomain } from '../utils';

const SettingsPage = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [currentDomain, setCurrentDomain] = useState();
  const [showResetDialog, setShowResetDialog] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(defaultSettings, settingValues => {
      setSettings(settingValues);
    });
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      setCurrentDomain(getDomain(tabs[0].url));
    });
  }, []);

  const changeSetting = (setting, value) => {
    chrome.storage.local.set({ [setting]: value }, () => {
      setSettings(oldSettings => ({ ...oldSettings, [setting]: value }));
    });
    chrome.tabs.query({}, tabs => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { [setting]: value });
      });
    });
  };

  const renderToggle = (settingID, enabledDescription, disabledDescription) => {
    return (
      <FormControlLabel
        control={
          <Switch
            checked={settings[settingID]}
            onChange={e => changeSetting(settingID, e.target.checked)}
          />
        }
        label={settings[settingID] ? enabledDescription : disabledDescription}
      />
    );
  };

  const toggleSiteBlock = blocked => {
    if (blocked) {
      changeSetting('blockedSites', [
        ...new Set([...settings.blockedSites, currentDomain]),
      ]);
    } else {
      changeSetting(
        'blockedSites',
        settings.blockedSites.filter(s => s !== currentDomain)
      );
    }
  };

  const enabledOnThisSite = !settings.blockedSites.includes(currentDomain);

  const disabledSettings = [];
  if (!enabledOnThisSite) disabledSettings.push('thisSite');
  if (!settings.enabled) disabledSettings.push('allSites');

  const handleDisableChange = (e, newSettings) => {
    toggleSiteBlock(newSettings.includes('thisSite'));
    changeSetting('enabled', !newSettings.includes('allSites'));
  };

  const resetBirdLog = () => {
    chrome.storage.local.set({ birdsSeen: {} });
  };

  return (
    <CheckboxContainer>
      <CenteredFlexColumn style={{ width: '100%' }}>
        <Typography>Disable birds on</Typography>
        <ToggleButtonGroup
          value={disabledSettings}
          onChange={handleDisableChange}
          size="small"
          style={{ marginBottom: '0.5rem' }}
        >
          <WideToggleButton
            color="warning"
            value="thisSite"
            disabled={!settings.enabled}
          >
            This site
          </WideToggleButton>
          <ToggleButton color="error" value="allSites">
            All sites
          </ToggleButton>
        </ToggleButtonGroup>
      </CenteredFlexColumn>
      {renderToggle('soundsEnabled', 'Sounds Enabled', 'Sounds Disabled')}
      {renderToggle(
        'flyFromCursor',
        'Birds Fly From Cursor',
        "Birds Don't Fly From Cursor"
      )}
      <CenteredFlexColumn style={{ width: '100%', marginTop: '0.5rem' }}>
        <Typography>Bird Limit</Typography>
        <Slider
          value={settings.maxBirds}
          onChange={(e, newVal) => changeSetting('maxBirds', newVal)}
          valueLabelDisplay="auto"
          min={1}
          max={10}
          sx={{ maxWidth: '90%' }}
        />
      </CenteredFlexColumn>
      <CenteredFlexColumn style={{ width: '100%', marginTop: '1rem' }}>
        <Button
          variant="outlined"
          color="error"
          onClick={() => setShowResetDialog(true)}
        >
          Reset Bird Log
        </Button>
      </CenteredFlexColumn>
      <Dialog
        open={showResetDialog}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => setShowResetDialog(false)}
      >
        <DialogTitle>Reset Bird Log?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {
              "This will reset all birds you've discovered. This can't be undone!"
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResetDialog(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setShowResetDialog(false);
              resetBirdLog();
            }}
            color="error"
          >
            Reset
          </Button>
        </DialogActions>
      </Dialog>
    </CheckboxContainer>
  );
};

export default SettingsPage;

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

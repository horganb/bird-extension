import React, { useEffect, useState } from 'react';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import { defaultSettings } from '../defaultSettings';
import { CenteredFlexColumn, CheckboxContainer } from './styles';

const SettingsPage = () => {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    chrome.storage.local.get(defaultSettings, settingValues => {
      setSettings(settingValues);
    });
  });

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

  return (
    <CheckboxContainer>
      {renderToggle('enabled', 'Birds Enabled', 'Birds Disabled')}
      {renderToggle('soundsEnabled', 'Sounds Enabled', 'Sounds Disabled')}
      {renderToggle(
        'flyFromCursor',
        'Birds Fly From Cursor',
        "Birds Don't Fly From Cursor"
      )}
      <CenteredFlexColumn style={{ width: '100%' }}>
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
    </CheckboxContainer>
  );
};

export default SettingsPage;

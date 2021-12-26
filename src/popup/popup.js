import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

const EnableSwitch = ({ defaultEnabled }) => {
  const [enabled, setEnabled] = useState(defaultEnabled);

  const setChecked = newChecked => {
    chrome.storage.local.set({ enabled: newChecked }, () => {
      setEnabled(newChecked);
    });
    chrome.tabs.query({}, tabs => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { enabled: newChecked });
      });
    });
  };

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}
    >
      <FormControlLabel
        control={
          <Switch
            checked={enabled}
            onChange={e => setChecked(e.target.checked)}
          />
        }
        label={enabled ? 'Birds Enabled' : 'Birds Disabled'}
      />
    </div>
  );
};

chrome.storage.local.get({ enabled: true }, ({ enabled }) => {
  ReactDOM.render(
    <EnableSwitch defaultEnabled={enabled} />,
    document.getElementById('app-root')
  );
});

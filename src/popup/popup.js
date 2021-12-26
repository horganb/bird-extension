import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Switch from '@mui/material/Switch';

const EnableSwitch = ({ defaultEnabled }) => {
  const [enabled, setEnabled] = useState(defaultEnabled);

  const setChecked = newChecked => {
    chrome.storage.local.set({ enabled: newChecked }, () => {
      setEnabled(newChecked);
    });
  };

  return (
    <Switch checked={enabled} onChange={e => setChecked(e.target.checked)} />
  );
};

chrome.storage.local.get(['enabled'], ({ enabled }) => {
  ReactDOM.render(
    <EnableSwitch defaultEnabled={enabled} />,
    document.getElementById('app-root')
  );
});

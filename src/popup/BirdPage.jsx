import React, { useEffect, useRef, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { BirdInspectorContainer, CenteredFlexColumn } from './styles';
import { defaultSettings } from '../defaultSettings';
import { getDomain, unavailableURLs } from '../utils';

const BirdPage = () => {
  const [birdImageURL, setBirdImageURL] = useState();
  const [birdTransform, setBirdTransform] = useState();
  const [birdName, setBirdName] = useState();
  const [birdSpecies, setBirdSpecies] = useState();
  const [birdIndex, setBirdIndex] = useState(0);
  const [numBirds, setNumBirds] = useState(0);
  const [settings, setSettings] = useState(defaultSettings);
  const [currentURL, setCurrentURL] = useState();

  const birdInspectorPort = useRef();

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      birdInspectorPort.current = chrome.tabs.connect(tabs[0].id, {
        name: 'birdInspector',
      });
      birdInspectorPort.current.postMessage({ getBird: true });
      birdInspectorPort.current.onMessage.addListener(msg => {
        setBirdImageURL(msg.image);
        setBirdTransform(msg.transform);
        setBirdName(msg.name);
        setBirdSpecies(msg.species);
        setBirdIndex(msg.index);
        setNumBirds(msg.numBirds);
        birdInspectorPort.current.postMessage({ getBird: true });
      });
    });

    chrome.storage.local.get(defaultSettings, settingValues => {
      setSettings(settingValues);
    });
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      setCurrentURL(tabs[0].url);
    });
  }, []);

  const leftBird = () => {
    birdInspectorPort.current?.postMessage({ left: true });
  };

  const rightBird = () => {
    birdInspectorPort.current?.postMessage({ right: true });
  };

  const unavailableOnThisSite =
    currentURL && unavailableURLs.some(url => currentURL.startsWith(url));
  const disabledOnThisSite =
    currentURL && settings.blockedSites.includes(getDomain(currentURL));
  const disabled = disabledOnThisSite || !settings.enabled;

  return unavailableOnThisSite ? (
    <p
      style={{
        opacity: 0.6,
        fontStyle: 'italic',
        textAlign: 'center',
        color: 'red',
      }}
    >
      Sorry, this page is a no bird zone! Try a different site.
    </p>
  ) : disabled ? (
    <p
      style={{
        opacity: 0.6,
        fontStyle: 'italic',
        textAlign: 'center',
        color: 'red',
      }}
    >
      Birds are disabled! To change this, click "Settings."
    </p>
  ) : birdName ? (
    <BirdInspectorContainer>
      <IconButton onClick={leftBird}>
        <ChevronLeftIcon />
      </IconButton>
      <CenteredFlexColumn>
        <h5 style={{ margin: 0, textAlign: 'center' }}>
          {birdIndex + 1}/{numBirds}
        </h5>
        <h2 style={{ margin: 0, textAlign: 'center' }}>{birdName}</h2>
        <h4
          style={{
            margin: 0,
            textAlign: 'center',
            fontStyle: 'italic',
          }}
        >
          {birdSpecies}
        </h4>
        <img
          src={birdImageURL}
          style={{
            transform: birdTransform,
            width: '40px',
            height: 'auto',
            imageRendering: 'pixelated',
          }}
        />
      </CenteredFlexColumn>
      <IconButton onClick={rightBird}>
        <ChevronRightIcon />
      </IconButton>
    </BirdInspectorContainer>
  ) : (
    <p
      style={{
        opacity: 0.8,
        fontStyle: 'italic',
        textAlign: 'center',
      }}
    >
      Birds will visit soon! Hang in there!
    </p>
  );
};

export default BirdPage;

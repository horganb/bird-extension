import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { randomBirdType } from './birdType';
import Bird, { ACTION_FACTOR } from './bird';
import './contentScriptStyles.css';
import { defaultSettings } from '../defaultSettings';
import ArrowDropDownOutlinedIcon from '@mui/icons-material/ArrowDropDownOutlined';
import birdContainer from './dom';
import { getDomain } from '../utils';

export const LOOP_SPEED = 10;

export const gameOptions = { ...defaultSettings };

let activeBirds = [];
let toRemove = [];

export const queueRemoval = bird => {
  toRemove.push(bird);
};

const spawn = type => {
  const newBird = new Bird(type);
  activeBirds.push(newBird);
};

const mainLoop = () => {
  if (chrome.runtime.id === undefined) {
    // if the extension was deactivated, remove birds.
    stopBirds();
    return;
  }

  const fullscreen = window.innerHeight === screen.height;
  if (fullscreen) {
    // pause in fullscreen
    removeBirds();
    return;
  }

  if (
    activeBirds.length < gameOptions.maxBirds &&
    Math.random() < 0.5 * ACTION_FACTOR
  ) {
    spawn(randomBirdType());
  }

  activeBirds.forEach(bird => {
    bird.update();
  });

  activeBirds = activeBirds.filter(bird => !toRemove.includes(bird));
  // remove birds that exceed the maxBirds setting
  for (let i = activeBirds.length - 1; i >= gameOptions.maxBirds; i--) {
    activeBirds[i].remove();
    activeBirds.pop();
  }
  toRemove = [];
};

let gameInterval;

const startBirds = () => {
  gameInterval = setInterval(mainLoop, LOOP_SPEED);
};

const removeBirds = () => {
  activeBirds.forEach(bird => {
    bird.remove();
  });
  activeBirds = [];
};

export const stopBirds = () => {
  removeBirds();
  clearInterval(gameInterval);
};

const getCurrentDomain = () => {
  return getDomain(window.location.href);
};

const enabledOnThisSite = options => {
  return !options.blockedSites.includes(getCurrentDomain());
};

chrome.runtime.onMessage.addListener(settings => {
  if (settings.enabled !== undefined) {
    if (settings.enabled && !gameOptions.enabled) {
      startBirds();
    } else if (!settings.enabled && gameOptions.enabled) {
      stopBirds();
    }
  }

  if (settings.blockedSites !== undefined) {
    if (enabledOnThisSite(settings) && !enabledOnThisSite(gameOptions)) {
      startBirds();
    } else if (!enabledOnThisSite(settings) && enabledOnThisSite(gameOptions)) {
      stopBirds();
    }
  }

  Object.assign(gameOptions, settings);
});

chrome.storage.local.get(null, settings => {
  Object.assign(gameOptions, settings);
  if (gameOptions.enabled && enabledOnThisSite(gameOptions)) {
    startBirds();
  }
});

const BirdIndicator = () => {
  const bird = useRef();
  const [birdPos, setBirdPos] = useState();

  useEffect(() => {
    chrome.runtime.onConnect.addListener(function (port) {
      if (port.name === 'birdInspector') {
        port.onMessage.addListener(function (msg) {
          if (msg.getBird) {
            if (!bird.current || !activeBirds.includes(bird.current)) {
              bird.current = activeBirds[0];
            }
            port.postMessage({
              image: bird.current?.getFrameURL(),
              transform: bird.current?.getTransform(),
              name: bird.current?.type.name,
              species: bird.current?.type.species,
              index: activeBirds.indexOf(bird.current),
              numBirds: activeBirds.length,
            });
          }
          if (msg.left) {
            const currentIndex = activeBirds.indexOf(bird.current);
            if (currentIndex === 0) {
              bird.current = activeBirds[activeBirds.length - 1];
            } else {
              bird.current = activeBirds[currentIndex - 1];
            }
          }
          if (msg.right) {
            const currentIndex = activeBirds.indexOf(bird.current);
            bird.current = activeBirds[(currentIndex + 1) % activeBirds.length];
          }
          setBirdPos(
            bird.current && [
              bird.current.location.x,
              bird.current.location.y - bird.current.getHeight(),
            ]
          );
        });
        port.onDisconnect.addListener(() => {
          setBirdPos();
        });
      }
    });
  }, []);

  return birdPos ? (
    <ArrowDropDownOutlinedIcon
      style={{
        position: 'absolute',
        left: `${birdPos[0]}px`,
        top: `${birdPos[1]}px`,
        transform: 'translateX(-50%) translateY(-75%)',
        zIndex: 2147483647,
        pointerEvents: 'none',
        animationName: 'arrowFlash',
        animationDuration: '3s',
        animationIterationCount: 'infinite',
        animationTimingFunction: 'linear',
      }}
    />
  ) : null;
};

ReactDOM.render(<BirdIndicator />, birdContainer);

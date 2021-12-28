import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { randomBirdType } from './birdType';
import Bird, { ACTION_FACTOR } from './bird';
import './contentScriptStyles.css';
import { defaultSettings } from '../defaultSettings';
import ArrowDropDownOutlinedIcon from '@mui/icons-material/ArrowDropDownOutlined';
import birdContainer from './dom';

export const LOOP_SPEED = 10;
export const MAX_BIRDS = 3;

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
  const fullscreen = window.innerHeight === screen.height;
  if (fullscreen) {
    // pause in fullscreen
    removeBirds();
    return;
  }

  if (activeBirds.length < MAX_BIRDS && Math.random() < 0.5 * ACTION_FACTOR) {
    spawn(randomBirdType());
  }
  activeBirds.forEach(bird => {
    bird.update();
  });
  activeBirds = activeBirds.filter(bird => !toRemove.includes(bird));
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

const stopBirds = () => {
  removeBirds();
  clearInterval(gameInterval);
};

chrome.runtime.onMessage.addListener(settings => {
  Object.assign(gameOptions, settings);
  if (settings.enabled) {
    startBirds();
  } else if (settings.enabled === false) {
    stopBirds();
  }
});

chrome.storage.local.get(null, settings => {
  Object.assign(gameOptions, settings);
  if (gameOptions.enabled) {
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
  ) : (
    <div>i</div>
  );
};

ReactDOM.render(<BirdIndicator />, birdContainer);

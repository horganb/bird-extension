import React from 'react';
import ReactDOM from 'react-dom';
import { randomBirdType } from './birdType';
import Bird, { ACTION_FACTOR } from './bird';
import './contentScriptStyles.css';
import { defaultSettings } from '../defaultSettings';
import birdContainer from './dom';
import { getDomain } from '../utils';
import BirdIndicator from './BirdIndicator';

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
    Math.random() < 0.55 * ACTION_FACTOR
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
  setTimeout(() => {
    // spawn bird after some time if none have spawned yet
    if (activeBirds.length === 0) {
      spawn(randomBirdType());
    }
  }, 1500);
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
  if (settings.enabled !== undefined && enabledOnThisSite(gameOptions)) {
    if (settings.enabled && !gameOptions.enabled) {
      startBirds();
    } else if (!settings.enabled && gameOptions.enabled) {
      stopBirds();
    }
  }

  if (settings.blockedSites !== undefined && gameOptions.enabled) {
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

ReactDOM.render(<BirdIndicator />, birdContainer);
